import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({
    example: 'Amoxicillin',
    description: 'Brand name of the medicine',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Amoxicillin trihydrate',
    description: 'Generic name of the medicine',
  })
  @IsString()
  @IsNotEmpty()
  genericName: string;

  @ApiProperty({
    example: 'Antibiotic used to treat bacterial infections',
    description: 'Description of the medicine',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 15.99,
    description: 'Price per unit',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({
    example: 'PharmaCorp',
    description: 'Manufacturer name',
  })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({
    example: 'otc',
    description:
      'The type of drugs either otc, for over the counter drug or Prescribed',
  })
  @IsIn(['otc', 'prescribed'])
  @IsOptional()
  type?: 'otc' | 'prescribed';

  @ApiProperty({
    example: '1234567890123',
    description: 'Barcode or UPC code',
    required: false,
  })
  @IsString()
  @IsOptional()
  barcode?: string;
}
