import { ApiProperty } from '@nestjs/swagger';
import { MedicineResponseDto } from './medicine-response.dto';

export class MedicinePaginatedDto {
  @ApiProperty({
    type: [MedicineResponseDto],
    description: 'List of medicines',
  })
  data: MedicineResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of medicines',
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
