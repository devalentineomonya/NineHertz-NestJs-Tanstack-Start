import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateConsultationDto {
  @ApiProperty({
    example: '2023-12-15T10:30:00Z',
    description: 'Start time of the consultation',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    example: '2023-12-15T11:00:00Z',
    description: 'End time of the consultation',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({
    example: 'session_123456789',
    description: 'Video session ID (for Stream integration)',
    required: false,
  })
  @IsString()
  @IsOptional()
  videoSessionId?: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of consultation in minutes',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    example: 'Patient presented with flu symptoms.',
    description: 'Doctor notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

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
}
