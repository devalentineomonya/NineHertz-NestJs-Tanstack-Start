import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Medicine ID',
  })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({
    example: 100,
    description: 'Current quantity in stock',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: 20,
    description: 'Reorder threshold (minimum quantity before reordering)',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  reorderThreshold: number;
}
