import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { User } from '../user/entities/user.entity';
import { PatientController } from './patient.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, User])],
  providers: [PatientService],
  exports: [PatientService],
  controllers: [PatientController],
})
export class PatientModule {}
