import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorDashboardController } from './doctor-dashboard.controller';
import { DoctorDashboardService } from './doctor-dashboard.service';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      Patient,
      Appointment,
      Prescription,
      Medicine,
      Notification,
      User,
    ]),
  ],
  controllers: [DoctorDashboardController],
  providers: [DoctorDashboardService],
  exports: [DoctorDashboardService],
})
export class DoctorDashboardModule {}
