import { ApiProperty } from '@nestjs/swagger';
import { InventoryItemResponseDto } from './inventory-item-response.dto';

export class InventoryItemPaginatedDto {
  @ApiProperty({
    type: [InventoryItemResponseDto],
    description: 'List of inventory items',
  })
  data: InventoryItemResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of inventory items',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;
}
