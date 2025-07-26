import Stripe from 'stripe';
import { TransactionStatus } from './entities/transaction.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-05-28.basil',
      },
    );
  }

  /** Initialize transaction and return checkout URL */
  async initializeTransaction(paymentData: {
    amount: number;
    currency: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    email: string;
    reference: string;
    metadata?: Record<string, any>;
  }): Promise<{ checkoutUrl: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: paymentData.successUrl,
        cancel_url: paymentData.cancelUrl,
        customer_email: paymentData.email,
        line_items: [
          {
            price_data: {
              currency: paymentData.currency,
              product_data: { name: paymentData.description },
              unit_amount: paymentData.amount * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          ...paymentData.metadata,
          reference: paymentData.reference,
        },
      });

      if (!session.url) {
        throw new InternalServerErrorException(
          'Failed to get Stripe checkout URL',
        );
      }

      return { checkoutUrl: session.url };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create checkout session';
      throw new InternalServerErrorException(
        `Stripe transaction init failed: ${message}`,
      );
    }
  }

  /** Verify payment after frontend confirmation */
  async verifyPayment(paymentIntentId: string): Promise<{
    id: string;
    status: TransactionStatus;
    response: Stripe.PaymentIntent;
  }> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      const success = intent.status === 'succeeded';

      return {
        id: intent.id,
        status: success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
        response: intent,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to verify payment';
      throw new InternalServerErrorException(
        `Stripe verification failed: ${message}`,
      );
    }
  }

  /** Refund a completed charge */
  async createRefund(chargeId: string) {
    try {
      return await this.stripe.refunds.create({ charge: chargeId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Process refund';
      throw new InternalServerErrorException(
        `Stripe refund failed: ${message}`,
      );
    }
  }
}
