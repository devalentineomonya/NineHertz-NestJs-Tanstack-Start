import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    });
  }

  charge(paymentData: {
    amount: number;
    currency: string;
    source: string;
    description: string;
  }) {
    return this.stripe.charges.create({
      amount: paymentData.amount,
      currency: paymentData.currency,
      source: paymentData.source,
      description: paymentData.description,
    });
  }
}
