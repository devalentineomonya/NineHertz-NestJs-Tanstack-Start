import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ConsultationFilter {
  @ApiPropertyOptional({
    description: 'Filter by patient ID',
    example: 'd6e087e1-9e7c-4e5d-b55c-9a1f3a9459dc',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by doctor ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by consultation date (YYYY-MM-DD format)',
    example: '2023-07-15',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
