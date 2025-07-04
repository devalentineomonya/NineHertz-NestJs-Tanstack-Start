import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateDoctorDto {
  @ApiProperty({
    example: 'Dr. Jane Smith-Jones',
    description: 'Updated full name',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'Pediatric Cardiology',
    description: 'Updated specialty',
    required: false,
  })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional({
    example: {
      days: ['Tuesday', 'Thursday'],
      hours: ['10:00-13:00', '15:00-18:00'],
    },
    description: 'Updated availability schedule',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  availability?: Record<string, any>;

  @ApiProperty({
    example: 175.0,
    description: 'Updated consultation fee',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  consultationFee?: number;

  @ApiProperty({
    example: 'MD654321',
    description: 'Updated license number',
    required: false,
  })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Updated healthcare institution ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  institutionId?: string;
}
