import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    example: '2023-12-15T10:30:00Z',
    description: 'Date and time of the appointment',
  })
  @IsDateString()
  @IsNotEmpty()
  datetime: Date;

  @ApiProperty({
    example: 'scheduled',
    description: 'Initial status of the appointment',
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Patient ID',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Doctor ID',
  })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({
    example: 'virtual',
    description: 'Type of the appointment',
    enum: [AppointmentType],
  })
  @IsEnum(AppointmentType)
  @IsNotEmpty()
  type: AppointmentType;
}
