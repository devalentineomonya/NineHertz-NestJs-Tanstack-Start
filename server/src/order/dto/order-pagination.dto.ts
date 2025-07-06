import { ApiPropertyOptional } from '@nestjs/swagger';

export class OrderPaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Current page number',
  })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
  })
  limit?: number;
}
