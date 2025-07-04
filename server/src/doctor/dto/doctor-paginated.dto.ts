import { ApiProperty } from '@nestjs/swagger';
import { DoctorResponseDto } from './doctor-response.dto';

export class DoctorPaginatedDto {
  @ApiProperty({
    type: [DoctorResponseDto],
    description: 'List of doctors',
  })
  data: DoctorResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of doctors',
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
