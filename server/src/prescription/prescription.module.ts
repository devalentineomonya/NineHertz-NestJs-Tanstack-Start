import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { Prescription } from './entities/prescription.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription,
      Patient,
      Doctor,
      Pharmacist,
      Notification,
    ]),
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, NotificationService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
