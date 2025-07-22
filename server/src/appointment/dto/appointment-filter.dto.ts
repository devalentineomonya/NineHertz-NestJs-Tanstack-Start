import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from 'src/enums/appointment.enum';

export class AppointmentFilter {
  @ApiPropertyOptional({
    description: 'The status of the appointment to filter by.',
    enum: AppointmentStatus,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description:
      'The unique identifier of the patient to filter appointments for.',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description:
      'The unique identifier of the doctor to filter appointments for.',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;
}
