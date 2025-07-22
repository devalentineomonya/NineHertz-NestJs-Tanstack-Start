import { ApiProperty } from '@nestjs/swagger';
import { PatientResponseDto } from '../../patient/dto/patient-response.dto';
import { DoctorResponseDto } from '../../doctor/dto/doctor-response.dto';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import {
  AppointmentType,
  AppointmentMode,
} from '../entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique appointment ID',
  })
  id: string;

  @ApiProperty({
    example: '2023-12-15T10:30:00Z',
    description: 'Appointment date and time',
  })
  datetime: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
    description: 'Appointment status',
  })
  status: AppointmentStatus;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
    description: 'Type of appointment (e.g., consultation, checkup)',
  })
  type: AppointmentType;

  @ApiProperty({
    enum: AppointmentMode,
    example: AppointmentMode.VIRTUAL,
    description: 'Mode of the appointment (physical or virtual)',
  })
  mode: AppointmentMode;

  @ApiProperty({
    example: 'appointment-1721573400000',
    nullable: true,
    description: 'Stream video session ID (only for virtual appointments)',
  })
  videoSessionId?: string;

  @ApiProperty({
    example: 'Discussing test results',
    nullable: true,
    description: 'Additional notes about the appointment',
  })
  notes?: string;

  @ApiProperty({
    type: PatientResponseDto,
    description: 'Patient details',
  })
  patient?: PatientResponseDto;

  @ApiProperty({
    type: DoctorResponseDto,
    description: 'Doctor details',
  })
  doctor?: DoctorResponseDto;

  @ApiProperty({
    example: '2023-11-01T08:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-11-05T14:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
