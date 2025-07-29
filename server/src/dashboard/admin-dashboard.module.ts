import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { DashboardController } from './admin-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Order } from 'src/order/entities/order.entity';
import { Review } from 'src/appointment/entities/review.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Patient,
      Doctor,
      Order,
      Notification,
      Review,
      Transaction,
    ]),
  ],
  controllers: [DashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
