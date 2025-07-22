import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentStatus } from 'src/enums/appointment.enum';
import {
  AppointmentType,
  AppointmentMode,
} from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '2023-12-15T10:30:00Z',
    description: 'Date and time of the appointment',
  })
  @IsDateString()
  @IsNotEmpty()
  datetime: Date;

  @ApiProperty({
    example: '2023-12-15T10:30:00Z',
    description: 'Start time of the appointment',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    example: '2023-12-15T11:30:00Z',
    description: 'End time of the appointment',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
    description: 'Initial status of the appointment',
    default: AppointmentStatus.SCHEDULED,
  })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
    description:
      'Type of the appointment (e.g., consultation, checkup, follow-up)',
  })
  @IsEnum(AppointmentType)
  @IsNotEmpty()
  type: AppointmentType;

  @ApiProperty({
    enum: AppointmentMode,
    example: AppointmentMode.VIRTUAL,
    description: 'Mode of the appointment (physical or virtual)',
    default: AppointmentMode.PHYSICAL,
  })
  @IsEnum(AppointmentMode)
  @IsNotEmpty()
  mode: AppointmentMode;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Patient ID',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    example: 'd47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Doctor ID',
  })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({
    example: 'Discussing test results and next steps',
    description: 'Additional notes about the appointment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'appointment-1721573400000',
    description: 'Stream video session ID (only for virtual appointments)',
    required: false,
  })
  @IsOptional()
  @IsString()
  videoSessionId?: string;
}
