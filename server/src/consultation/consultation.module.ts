import { Module } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { Consultation } from './entities/consultation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
// import { StreamService } from 'src/stream/stream.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consultation, Doctor, Patient]),
    // StreamService,
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService],
})
export class ConsultationModule {}
