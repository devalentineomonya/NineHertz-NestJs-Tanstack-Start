import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/enums/order.enum';
import { NotificationService } from 'src/notification/notification.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { InitiatePaymentDto } from 'src/transactions/dto/initiate-transaction.dto';
import { RefundTransactionDto } from 'src/transactions/dto/refund-transaction.dto';
import {
  Gateway,
  TransactionStatus,
} from 'src/transactions/entities/transaction.entity';
import { TransactionService } from 'src/transactions/transaction.service';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Medicine } from '../medicine/entities/medicine.entity';
import { Patient } from '../patient/entities/patient.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { OrderPaginatedDto } from './dto/order-paginated.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    private transactionService: TransactionService,
    private notificationService: NotificationService,
    private mailService: MailService,
  ) {}

  async create(createDto: CreateOrderDto): Promise<OrderResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: createDto.patientId },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createDto.patientId} not found`,
      );
    }

    const medicineIds = createDto.items.map((item) => item.medicineId);
    const medicines = await this.medicineRepository.findBy({
      id: In(medicineIds),
    });

    if (medicines.length !== medicineIds.length) {
      const foundIds = medicines.map((m) => m.id);
      const missingIds = medicineIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Medicines not found: ${missingIds.join(', ')}`,
      );
    }

    const order = this.orderRepository.create({
      status: createDto.status || OrderStatus.PENDING,
      totalAmount: createDto.totalAmount,
      patient,
    });

    const orderItems = createDto.items.map((itemDto) => {
      const medicine = medicines.find((m) => m.id === itemDto.medicineId);
      return this.orderItemRepository.create({
        quantity: itemDto.quantity,
        pricePerUnit: itemDto.pricePerUnit,
        medicine,
      });
    });

    order.items = orderItems;
    const savedOrder = await this.orderRepository.save(order);

    await this.sendOrderNotifications(
      savedOrder,
      'created',
      OrderStatus.PENDING,
    );
    return this.mapToResponseDto(savedOrder);
  }

  async findAll(
    pagination: PaginationDto,
    filters: OrderFilterDto,
  ): Promise<OrderPaginatedDto> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.patientId) {
      where.patient = { id: filters.patientId };
    }

    if (filters.fromDate && filters.toDate) {
      where.orderDate = Between(
        new Date(filters.fromDate),
        new Date(filters.toDate),
      );
    } else if (filters.fromDate) {
      where.orderDate = MoreThanOrEqual(new Date(filters.fromDate));
    } else if (filters.toDate) {
      where.orderDate = LessThanOrEqual(new Date(filters.toDate));
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: [
        'patient',
        'patient.user',
        'items',
        'items.medicine',
        'transactions',
      ],
      take: limit,
      skip,
      order: { orderDate: 'DESC' },
    });

    return {
      data: orders.map((order) => this.mapToResponseDto(order)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'items',
        'items.medicine',
        'transactions',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponseDto(order);
  }

  async update(
    id: string,
    updateDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'items',
        'items.medicine',
        'transactions',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    const originalStatus = order.status;

    if (updateDto.status) {
      order.status = updateDto.status;
    }

    if (updateDto.totalAmount) {
      order.totalAmount = updateDto.totalAmount;
    }

    if (updateDto.items) {
      await this.orderItemRepository.delete({ order: { id } });

      const medicineIds = updateDto.items
        .filter((item) => item.medicineId)
        .map((item) => item.medicineId);

      const medicines = await this.medicineRepository.findBy({
        id: In(medicineIds),
      });

      const orderItems = updateDto.items.map((itemDto) => {
        const medicine = medicines.find((m) => m.id === itemDto.medicineId);
        return this.orderItemRepository.create({
          quantity: itemDto.quantity,
          pricePerUnit: itemDto.pricePerUnit,
          medicine,
          order,
        });
      });

      order.items = await this.orderItemRepository.save(orderItems);
    }

    const updatedOrder = await this.orderRepository.save(order);
    if (updateDto.status && updateDto.status !== originalStatus) {
      await this.sendOrderNotifications(
        updatedOrder,
        'updated',
        updateDto.status,
      );
    }

    return this.mapToResponseDto(updatedOrder);
  }

  async processPayment(
    id: string,
    paymentMethod: Gateway,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be paid');
    }

    const transactionDto: InitiatePaymentDto = {
      amount: order.totalAmount,
      gateway:
        paymentMethod === Gateway.STRIPE ? Gateway.STRIPE : Gateway.PAYSTACK,
      customerEmail: order.patient.user.email,
      description: `Payment for Order #${order.id}`,
    };

    const transaction = await this.transactionService.initiateTransaction(
      order.patient.user.id,
      transactionDto,
    );

    if (transaction) {
      order.status = OrderStatus.PROCESSING;
      await this.updateInventory(order.id);
    } else {
      order.status = OrderStatus.FAILED;
    }

    const updatedOrder = await this.orderRepository.save(order);
    await this.sendOrderNotifications(updatedOrder, 'updated', order.status);
    return this.mapToResponseDto(updatedOrder);
  }

  async cancelOrder(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'transactions'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Only pending or processing orders can be cancelled',
      );
    }

    // Check if order has been paid
    const paidTransaction = order.transactions?.find(
      (t) => t.status === TransactionStatus.SUCCESS,
    );

    // Process refund if payment was successful
    let refundStatus: 'refunded' | 'pending' | 'failed' | 'not_required' =
      'not_required';

    if (paidTransaction) {
      try {
        const refundDto: RefundTransactionDto = {
          transactionId: paidTransaction.id,
          reason: 'Order cancellation',
        };

        await this.transactionService.refundTransaction(refundDto);
        refundStatus = 'refunded';
      } catch (error) {
        refundStatus = 'failed';
        // Log error but continue with cancellation
        console.error(`Refund failed for order ${id}:`, error);
      }
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.orderRepository.save(order);

    // Send notifications with refund status
    await this.sendOrderNotifications(
      updatedOrder,
      'cancelled',
      OrderStatus.CANCELLED,
      refundStatus,
    );

    return this.mapToResponseDto(updatedOrder);
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'transactions'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.items?.length) {
      await this.orderItemRepository.remove(order.items);
    }

    if (order.transactions?.length) {
      await this.transactionService.removeTransactions(order.transactions);
    }

    await this.orderRepository.delete(id);
  }

  private async updateInventory(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.medicine'],
    });

    if (!order) return;

    for (const item of order.items) {
      console.log(`Updating inventory for medicine ${item.medicine.id}`);
    }
  }

  private mapToResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      patient: {
        id: order.patient.id,
        fullName: order.patient.fullName,
        phone: order.patient.phone,
        dateOfBirth: order.patient.dateOfBirth,
        medicalHistory: order.patient.medicalHistory,
        user: {
          id: order.patient.user.id,
          email: order.patient.user.email,
          role: order.patient.user.role,
          isEmailVerified: order.patient.user.isEmailVerified,
          profilePicture: order.patient.user?.profilePicture || '',
          createdAt: order.patient.user.createdAt,
        },
      },
      items: order.items?.map((item) => this.mapItemToResponseDto(item)) || [],
      transactions:
        order.transactions?.map((t) => ({
          id: t.id,
          reference: t.reference,
          amount: t.amount,
          status: t.status,
          gateway: t.gateway,
          createdAt: t.createdAt,
          gatewayReference: t.gatewayReference,
          updatedAt: t.updatedAt,
          userId: t.user?.id ?? null,
          checkoutUrl: t.checkoutUrl || '',
        })) || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private getPaymentStatus(order: Order): string {
    if (!order.transactions || order.transactions.length === 0) {
      return 'unpaid';
    }

    const successful = order.transactions.some(
      (t) => t.status === TransactionStatus.SUCCESS,
    );
    const refunded = order.transactions.some(
      (t) => t.status === TransactionStatus.REFUNDED,
    );

    return refunded ? 'refunded' : successful ? 'paid' : 'unpaid';
  }

  private mapItemToResponseDto(item: OrderItem): OrderItemResponseDto {
    return {
      id: item.id,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      medicine: {
        id: item.medicine.id,
        type: item.medicine.type,
        name: item.medicine.name,
        genericName: item.medicine.genericName,
        description: item.medicine.description,
        price: item.medicine.price,
        manufacturer: item.medicine.manufacturer,
        barcode: item.medicine.barcode,
        createdAt: item.medicine.createdAt,
        updatedAt: item.medicine.updatedAt,
      },
    };
  }
  private async sendOrderNotifications(
    order: Order,
    action: 'created' | 'updated' | 'cancelled',
    status: OrderStatus,
    refundStatus?: 'refunded' | 'pending' | 'failed' | 'not_required',
  ) {
    // Load relations if not already loaded
    if (!order.patient?.user) {
      order = await this.orderRepository.findOneOrFail({
        where: { id: order.id },
        relations: ['patient', 'patient.user', 'items', 'items.medicine'],
      });
    }

    // Prepare notification message
    const messages = {
      created: `New order #${order.id} created`,
      updated: `Order #${order.id} updated to ${status}`,
      cancelled: `Order #${order.id} cancelled`,
    };

    let refundMessage = '';
    if (action === 'cancelled') {
      switch (refundStatus) {
        case 'refunded':
          refundMessage = 'A refund has been processed for your payment.';
          break;
        case 'pending':
          refundMessage = 'Your refund is being processed.';
          break;
        case 'failed':
          refundMessage = 'Refund processing failed. Please contact support.';
          break;
        case 'not_required':
          refundMessage = 'No payment was made for this order.';
          break;
      }
    }

    // Add refund message to notification
    const fullMessage = `${messages[action]} ${refundMessage}`.trim();

    const userId = order.patient.user.id;
    const eventType = `order:${action}` as 'order';

    // Send push notification
    await this.notificationService.triggerNotification(userId, {
      message: fullMessage,
      eventType,
      eventId: order.id,
      datetime: new Date().toISOString(),
    });
    // Trigger real-time update
    await this.notificationService.triggerPusherEvent(
      [userId.toString()],
      eventType,
      {
        id: order.id,
        status,
        message: fullMessage,
      },
    );

    // Prepare email content
    const emailItems = order.items.map((item) => ({
      name: item.medicine.name,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      total: item.quantity * item.pricePerUnit,
    }));

    // Send email
    await this.mailService.sendOrderEmail(order.patient.user.email, {
      patientName: order.patient.fullName,
      orderId: order.id,
      orderDate: order.orderDate.toLocaleDateString(),
      status,
      items: emailItems,
      totalAmount: order.totalAmount,
      action,
      refundStatus,
      refundMessage,
    });
  }
}
