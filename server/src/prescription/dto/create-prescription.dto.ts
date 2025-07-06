import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Details of the medication prescribed' })
  @IsNotEmpty()
  @IsString()
  medicationDetails: string;

  @ApiProperty({
    description: 'Date when the prescription was issued',
    example: '2023-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiProperty({
    description: 'Date when the prescription expires',
    example: '2023-12-31',
  })
  @IsNotEmpty()
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: 'UUID of the patient' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'UUID of the doctor' })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @ApiPropertyOptional({ description: 'UUID of the pharmacy (optional)' })
  @IsOptional()
  @IsUUID()
  pharmacyId?: string;
}
