import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

export class OrderPaginatedDto {
  @ApiProperty({
    type: [OrderResponseDto],
    description: 'List of orders',
  })
  data: OrderResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of orders',
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
