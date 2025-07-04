import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.paystack.co';

  constructor() {
    this.apiKey = process.env.PAYSTACK_SECRET_KEY as string;
  }

  async initializeTransaction(transactionData: {
    email: string;
    amount: number;
    reference: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: transactionData.email,
        amount: transactionData.amount,
        reference: transactionData.reference,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.data;
  }
}
