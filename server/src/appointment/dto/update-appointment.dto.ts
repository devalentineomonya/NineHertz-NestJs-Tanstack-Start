import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AppointmentStatus } from 'src/enums/appointment.enum';

export class UpdateAppointmentDto {
  @ApiProperty({
    example: '2023-12-15T11:00:00Z',
    description: 'Updated date and time',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  datetime?: Date;

  @ApiProperty({
    example: 'completed',
    description: 'Updated status',
    enum: AppointmentStatus,
    required: false,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Updated patient ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Updated doctor ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  doctorId?: string;
}
