import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateInventoryItemDto {
  @ApiProperty({
    example: 85,
    description: 'Updated quantity in stock',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    example: 25,
    description: 'Updated reorder threshold',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderThreshold?: number;
}
