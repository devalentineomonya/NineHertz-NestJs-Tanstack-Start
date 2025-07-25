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

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, OrderItem, Patient, Order])],
  controllers: [OrderController],
  providers: [OrderService, PaystackService, StripeService],
})
export class OrderModule {}
