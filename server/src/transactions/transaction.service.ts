import Stripe from 'stripe';
import {
  BadRequestException,
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { TransactionPaginatedDto } from './dto/transaction-paginated.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

import { InitiatePaymentDto } from './dto/initiate-transaction.dto';
import {
  Gateway,
  Transaction,
  TransactionStatus,
} from './entities/transaction.entity';
import { PaystackService } from './paystack.service';
import { StripeService } from './stripe.service';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
interface StripeResponse {
  id: string;
  status: TransactionStatus;
  response: Stripe.Checkout.Session;
}

interface PaystackResponse {
  id: number;
  status: string;
  response: Transaction;
}

interface StripeJwtPayload {
  reference: string;
  amount: number;
  userId: string;
  orderId?: string;
  appointmentId?: string;
  iat?: number;
  exp?: number;
}

type GatewayResponse<T extends Gateway> = T extends Gateway.STRIPE
  ? StripeResponse
  : T extends Gateway.PAYSTACK
    ? PaystackResponse
    : never;

type VerificationResult<T extends Gateway> = {
  verified: boolean;
  gatewayResponse: GatewayResponse<T>;
};

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @Inject(REQUEST)
    private readonly request: Request,
    private stripeService: StripeService,
    private paystackService: PaystackService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async initiateTransaction(
    userId: string,
    initiateDto: InitiatePaymentDto,
  ): Promise<{
    transaction: Transaction;
    accessCode?: string;
    checkoutUrl?: string;
  }> {
    // Validate required associations
    if (!initiateDto.orderId && !initiateDto.appointmentId) {
      throw new BadRequestException(
        'Transaction must be associated with an order or appointment',
      );
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const { orderId, appointmentId, ...restDto } = initiateDto;
    let order: Order | null = null;
    let appointment: Appointment | null = null;

    if (orderId) {
      order = await this.orderRepository.findOneBy({ id: orderId });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (appointmentId) {
      appointment = await this.appointmentRepository.findOneBy({
        id: appointmentId,
      });
      if (!appointment) {
        throw new NotFoundException(`Appointment ${appointmentId} not found`);
      }
    }

    // Check for an existing transaction
    const existingTransaction = await this.transactionRepository.findOne({
      where: [
        orderId ? { order: { id: orderId } } : {},
        appointmentId ? { appointment: { id: appointmentId } } : {},
      ],
      relations: ['order', 'appointment'],
    });

    if (existingTransaction) {
      if (existingTransaction.status !== TransactionStatus.SUCCESS) {
        // Return the existing transaction with accessCode/checkoutUrl
        return {
          transaction: existingTransaction,
          accessCode: existingTransaction.accessCode,
          checkoutUrl: existingTransaction.checkoutUrl,
        };
      } else {
        throw new BadRequestException(
          'Transaction already completed for this order/appointment',
        );
      }
    }

    // Create new transaction
    const reference = this.generateReference(initiateDto.gateway);

    try {
      let accessCode: string | undefined;
      let checkoutUrl: string | undefined;
      let gatewayReference: string;
      const baseUrl =
        this.request.protocol + '://' + this.request.headers.host + '/';

      const newUrl = new URL(this.request.url, baseUrl);
      switch (initiateDto.gateway) {
        case Gateway.STRIPE: {
          const stripeInit = await this.stripeService.initializeTransaction({
            amount: initiateDto.amount ?? 0,
            currency: 'usd',
            description: initiateDto.description ?? '',
            successUrl: `${newUrl.origin}/stripe/success`,
            cancelUrl: `${newUrl.origin}/stripe/cancel`,
            email: user?.email,
            reference,
            userId,
            orderId: orderId || undefined,
            appointmentId: appointmentId || undefined,
          });
          checkoutUrl = stripeInit.checkoutUrl;

          gatewayReference = stripeInit.sessionId;
          break;
        }
        case Gateway.PAYSTACK: {
          const paystackInit = await this.paystackService.initializeTransaction(
            {
              email: initiateDto.customerEmail ?? '',
              amount: String(initiateDto.amount),
              reference,
            },
          );
          accessCode = paystackInit?.access_code || undefined;
          gatewayReference = reference;
          break;
        }
        default:
          throw new InternalServerErrorException('Unsupported payment gateway');
      }

      const transaction = this.transactionRepository.create({
        gateway: restDto.gateway,
        amount: restDto.amount,
        description: restDto.description,
        reference,
        gatewayReference,
        accessCode,
        checkoutUrl,
        status: TransactionStatus.PENDING,
        user,
        order: order ?? undefined,
        appointment: appointment ?? undefined,
      } as Partial<Transaction>);

      const savedTransaction =
        await this.transactionRepository.save(transaction);

      return { transaction: savedTransaction, accessCode, checkoutUrl };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Transaction initiation failed';
      throw new InternalServerErrorException(message);
    }
  }

  async verifyPayment<T extends Gateway>(
    reference: string,
    gateway: T,
  ): Promise<Transaction> {
    try {
      let result: VerificationResult<T>;

      switch (gateway) {
        case Gateway.STRIPE: {
          const stripeResponse =
            await this.stripeService.verifyPayment(reference);
          result = {
            verified: stripeResponse.status === TransactionStatus.SUCCESS,
            gatewayResponse:
              stripeResponse.response as unknown as GatewayResponse<T>,
          } as VerificationResult<T>;
          break;
        }

        case Gateway.PAYSTACK: {
          const paystackResponse =
            await this.paystackService.verifyTransaction(reference);
          if (!paystackResponse) {
            throw new InternalServerErrorException('Paystack response is null');
          }
          result = {
            verified: paystackResponse.status === 'success',
            gatewayResponse: paystackResponse as unknown as GatewayResponse<T>,
          } as VerificationResult<T>;
          break;
        }

        default:
          throw new InternalServerErrorException('Unsupported payment gateway');
      }

      const transaction = await this.transactionRepository.findOne({
        where: { reference },
      });

      if (!transaction) {
        throw new NotFoundException(
          `Transaction with reference ${reference} not found`,
        );
      }

      transaction.status = result.verified
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILED;
      transaction.gatewayResponse = result.gatewayResponse;
      transaction.processedAt = new Date();

      return await this.transactionRepository.save(transaction);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Payment verification failed';
      throw new InternalServerErrorException(message);
    }
  }

  /** New method to verify Stripe payment using JWT token */
  async verifyStripePaymentWithToken(token: string): Promise<Transaction> {
    try {
      const payload = this.jwtService.verify<StripeJwtPayload>(token, {
        secret: this.configService.getOrThrow('PAYMENT_JWT_SECRET'),
      });
      const transaction = await this.transactionRepository.findOne({
        where: { reference: payload.reference },
      });

      if (!transaction) {
        throw new NotFoundException(
          `Transaction with reference ${payload.reference} not found`,
        );
      }

      const stripeResponse = await this.stripeService.verifyPaymentWithToken(
        transaction.gatewayReference,
      );

      // Verify that the gateway reference matches the session ID
      if (transaction.gatewayReference !== stripeResponse.id) {
        throw new BadRequestException('Transaction session ID mismatch');
      }

      transaction.status = stripeResponse.status;
      transaction.gatewayResponse = stripeResponse.response;
      transaction.processedAt = new Date();
      transaction.paidAt =
        stripeResponse.status === TransactionStatus.SUCCESS
          ? new Date()
          : transaction.paidAt;

      return await this.transactionRepository.save(transaction);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Stripe verification failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findAllTransactions(
    query: TransactionQueryDto,
    pagination: PaginationDto,
  ): Promise<TransactionPaginatedDto> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Transaction> = {};

    if (query.status) where.status = query.status;
    if (query.gateway) where.gateway = query.gateway;
    if (query.userId) where.user = { id: query.userId };
    if (query.orderId) where.order = { id: query.orderId };
    if (query.appointmentId) where.appointment = { id: query.appointmentId };

    if (query.fromDate && query.toDate) {
      where.createdAt = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    } else if (query.fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(query.fromDate));
    } else if (query.toDate) {
      where.createdAt = LessThanOrEqual(new Date(query.toDate));
    }

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where,
        relations: ['user', 'order', 'appointment'],
        take: limit,
        skip,
        order: { createdAt: 'DESC' },
      },
    );

    return {
      data: transactions.map((t) => this.mapToResponseDto(t)),
      total,
      page,
      limit,
    };
  }

  async findTransactionById(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'order', 'appointment'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.mapToResponseDto(transaction);
  }

  async refundTransaction(
    refundDto: RefundTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: refundDto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${refundDto.transactionId} not found`,
      );
    }

    if (transaction.status !== TransactionStatus.SUCCESS) {
      throw new BadRequestException(
        'Only successful transactions can be refunded',
      );
    }

    try {
      switch (transaction.gateway) {
        case Gateway.STRIPE:
          await this.stripeService.createRefund(transaction.gatewayReference);
          break;
        case Gateway.PAYSTACK:
          await this.paystackService.refundTransaction({
            transaction: transaction.gatewayReference,
          });
          break;
        default:
          throw new InternalServerErrorException('Unsupported payment gateway');
      }

      // Create refund transaction record
      const refundTransaction = this.transactionRepository.create({
        amount: transaction.amount,
        status: TransactionStatus.REFUNDED,
        description: `Refund of transaction ${transaction.reference}`,
        gateway: transaction.gateway,
        gatewayReference: `refund_${transaction.gatewayReference}`,
        refundReason: refundDto.reason,
        metadata: {
          originalTransaction: transaction.id,
          ...refundDto.metadata,
        },
        user: transaction.user,
        order: transaction.order,
        appointment: transaction.appointment,
      });

      const savedRefund =
        await this.transactionRepository.save(refundTransaction);

      // Update original transaction status
      transaction.status = TransactionStatus.REFUNDED;
      await this.transactionRepository.save(transaction);

      return this.mapToResponseDto(savedRefund);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to refund';
      throw new InternalServerErrorException(`Refund failed: ${message}`);
    }
  }

  async removeTransactions(transactions: Transaction[]) {
    await this.transactionRepository.remove(transactions);
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount,
      status: transaction.status,
      description: transaction.description,
      gateway: transaction.gateway,
      gatewayReference: transaction.gatewayReference,
      gatewayFees: transaction.gatewayFees,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      paidAt: transaction.paidAt,
      refundReason: transaction.refundReason,
      metadata: transaction.metadata,
      userId: transaction.user?.id,
      orderId: transaction.order?.id,
      appointmentId: transaction.appointment?.id,
    };
  }

  private generateReference(gateway: Gateway): string {
    const prefix = gateway === Gateway.STRIPE ? 'STRP' : 'PSTK';
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}_${timestamp}${random}`;
  }
}
