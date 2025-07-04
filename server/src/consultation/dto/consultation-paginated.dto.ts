import { ApiProperty } from '@nestjs/swagger';
import { ConsultationResponseDto } from './consultation-response.dto';

export class ConsultationPaginatedDto {
  @ApiProperty({
    type: [ConsultationResponseDto],
    description: 'List of consultations',
  })
  data: ConsultationResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of consultations',
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
