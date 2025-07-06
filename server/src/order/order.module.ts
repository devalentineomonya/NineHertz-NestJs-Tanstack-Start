import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Patient } from 'src/patient/entities/patient.entity';
import { OrderItem } from './entities/order-item.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { PaystackService } from 'src/payment/paystack.service';
import { StripeService } from 'src/payment/stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, OrderItem, Patient, Order])],
  controllers: [OrderController],
  providers: [OrderService, PaystackService, StripeService],
})
export class OrderModule {}
