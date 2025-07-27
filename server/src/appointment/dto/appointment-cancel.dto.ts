import { IsOptional, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
