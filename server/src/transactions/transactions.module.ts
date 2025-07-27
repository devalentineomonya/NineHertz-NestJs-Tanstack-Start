import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PaystackService } from './paystack.service';
import { StripeService } from './stripe.service';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { StripeVerificationController } from './stripe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User, Order, Appointment])],
  exports: [TransactionService],
  providers: [TransactionService, PaystackService, StripeService],
  controllers: [TransactionController, StripeVerificationController],
})
export class TransactionsModule {}
