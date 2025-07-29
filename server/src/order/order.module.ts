import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { PaystackService } from 'src/transactions/paystack.service';
import { StripeService } from 'src/transactions/stripe.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TransactionService } from 'src/transactions/transaction.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { NotificationService } from 'src/notification/notification.service';
import { MailService } from 'src/shared/mail/mail.service';
import { Notification } from 'src/notification/entities/notification.entity';
import { PushSubscription } from 'src/notification/entities/push-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Medicine,
      OrderItem,
      Patient,
      Order,
      Transaction,
      User,
      Appointment,
      Notification,
      PushSubscription,
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    PaystackService,
    StripeService,
    TransactionService,
    NotificationService,
    MailService,
  ],
})
export class OrderModule {}
