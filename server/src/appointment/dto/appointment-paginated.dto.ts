import { ApiProperty } from '@nestjs/swagger';
import { AppointmentResponseDto } from './appointment-response.dto';

export class AppointmentPaginatedDto {
  @ApiProperty({
    type: [AppointmentResponseDto],
    description: 'List of appointments',
  })
  data: AppointmentResponseDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of appointments',
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
