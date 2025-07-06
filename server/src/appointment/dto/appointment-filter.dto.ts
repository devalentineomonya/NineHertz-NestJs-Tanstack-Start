import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from 'src/enums/appointment.enum';

export class AppointmentFilter {
  @ApiPropertyOptional({
    description: 'The status of the appointment to filter by.',
    enum: AppointmentStatus,
    example: 'PENDING',
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description:
      'The unique identifier of the patient to filter appointments for.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description:
      'The unique identifier of the doctor to filter appointments for.',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;
}
