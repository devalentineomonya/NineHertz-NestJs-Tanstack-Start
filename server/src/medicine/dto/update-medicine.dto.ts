import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateMedicineDto {
  @ApiProperty({
    example: 'Amoxicillin 500mg',
    description: 'Updated brand name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Amoxicillin trihydrate',
    description: 'Updated generic name',
    required: false,
  })
  @IsString()
  @IsOptional()
  genericName?: string;

  @ApiProperty({
    example: 'Antibiotic for bacterial infections, 500mg capsules',
    description: 'Updated description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 16.5,
    description: 'Updated price per unit',
    minimum: 0.01,
    required: false,
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'Global Pharma',
    description: 'Updated manufacturer name',
    required: false,
  })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({
    example: '1234567890128',
    description: 'Updated barcode',
    required: false,
  })
  @IsString()
  @IsOptional()
  barcode?: string;
}
