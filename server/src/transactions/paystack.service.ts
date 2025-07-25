import { Injectable, BadRequestException } from '@nestjs/common';
import { Paystack } from 'paystack-sdk';
@Injectable()
export class PaystackService {
  private readonly paystack: Paystack;

  constructor() {
    const apiKey = process.env.PAYSTACK_SECRET_KEY as string;
    if (!apiKey) {
      throw new Error('PAYSTACK_SECRET_KEY not set in environment variables');
    }
    this.paystack = new Paystack(apiKey);
  }

  /**===================================
   * Create a customer on Paystack
  ======================================= */
  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) {
    try {
      const response = await this.paystack.customer.create({
        ...data,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Customer creation failed';
      throw new BadRequestException(errorMessage);
    }
  }

  /**====================================
   * Initialize a transaction
   =====================================*/
  async initializeTransaction(data: {
    email: string;
    amount: string;
    reference: string;
    callback_url?: string;
  }) {
    try {
      const response = await this.paystack.transaction.initialize(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Transaction initialization failed';
      throw new BadRequestException(errorMessage);
    }
  }

  /**========================================
   * Verify a transaction by reference
  ========================================== */
  async verifyTransaction(reference: string) {
    try {
      const response = await this.paystack.transaction.verify(reference);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Transaction verification failed';
      throw new BadRequestException(errorMessage);
    }
  }

  /**===========================================================
   * Charge an existing customer by email (for saved cards)
   ============================================================*/
  async chargeAuthorization(data: {
    email: string;
    amount: string;
    authorization_code: string;
    reference: string;
  }) {
    try {
      const response =
        await this.paystack.transaction.chargeAuthorization(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Change authorization failed';
      throw new BadRequestException(errorMessage);
    }
  }

  /**============================
   * List transactions
  ==============================*/
  async listTransactions(params?: { perPage?: number; page?: number }) {
    try {
      const response = await this.paystack.transaction.list(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to list transactions';
      throw new BadRequestException(errorMessage);
    }
  }
}
