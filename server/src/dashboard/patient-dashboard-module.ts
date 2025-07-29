import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Order } from 'src/order/entities/order.entity';
import { Review } from 'src/appointment/entities/review.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { PatientDashboardController } from './patient-dashboard.controller';
import { User } from 'src/user/entities/user.entity';
import { PatientDashboardService } from './patient-dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Prescription,
      Medicine,
      Notification,
      Patient,
      Doctor,
      Order,
      Review,
      Transaction,
      User,
    ]),
  ],
  controllers: [PatientDashboardController],
  providers: [PatientDashboardService],
})
export class PatientDashboardModule {}
