// src/consultation/dto/update-consultation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateConsultationDto {
  @ApiProperty({
    example: '2023-12-15T10:45:00Z',
    description: 'Updated start time',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @ApiProperty({
    example: '2023-12-15T11:15:00Z',
    description: 'Updated end time',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({
    example: 'session_987654321',
    description: 'Updated video session ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  videoSessionId?: string;

  @ApiProperty({
    example: 45,
    description: 'Updated duration in minutes',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    example: 'Additional notes after follow-up.',
    description: 'Updated doctor notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

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
