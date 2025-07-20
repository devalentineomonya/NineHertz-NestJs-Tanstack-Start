import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsArray,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PrescriptionItemDto {
  @ApiProperty({ description: 'UUID of the medicine' })
  @IsNotEmpty()
  @IsUUID()
  medicineId: string;

  @ApiProperty({ description: 'Dosage for the medicine', example: '500mg' })
  @IsNotEmpty()
  @IsString()
  dosage: string;

  @ApiProperty({ description: 'Frequency of intake', example: 'once a day' })
  @IsNotEmpty()
  @IsString()
  frequency: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'List of prescribed items (medications)',
    type: [PrescriptionItemDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];

  @ApiProperty({
    description: 'Date when the prescription was issued',
    example: '2025-07-18',
  })
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiProperty({
    description: 'Date when the prescription expires',
    example: '2025-07-21',
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

  @ApiPropertyOptional({ description: 'UUID of the pharmacist (optional)' })
  @IsOptional()
  @IsUUID()
  pharmacistId?: string;
}
