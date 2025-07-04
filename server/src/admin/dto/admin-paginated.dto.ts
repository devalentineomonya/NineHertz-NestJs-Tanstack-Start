import { ApiProperty } from '@nestjs/swagger';
import { AdminResponseDto } from './admin-response.dto';

export class AdminPaginatedDto {
  @ApiProperty({
    type: [AdminResponseDto],
    description: 'List of admins',
  })
  data: AdminResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of records',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of records per page',
  })
  limit: number;
}
