import { ApiProperty } from '@nestjs/swagger';

export class MedicineResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique medicine ID',
  })
  id: string;

  @ApiProperty({
    example: 'Amoxicillin',
    description: 'Brand name',
  })
  name: string;

  @ApiProperty({
    example: 'Amoxicillin trihydrate',
    description: 'Generic name',
  })
  genericName: string;

  @ApiProperty({
    example: 'Antibiotic used to treat bacterial infections',
    description: 'Medicine description',
  })
  description: string;

  @ApiProperty({
    example: 15.99,
    description: 'Price per unit',
  })
  price: number;

  @ApiProperty({
    example: 'PharmaCorp',
    description: 'Manufacturer name',
  })
  manufacturer: string;

  @ApiProperty({
    example: '1234567890123',
    description: 'Barcode',
  })
  barcode: string;

  @ApiProperty({
    example: '2023-08-10T08:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-08-20T14:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
