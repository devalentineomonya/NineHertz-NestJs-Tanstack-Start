import { TransactionResponseDto } from './transaction-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionPaginatedDto {
  @ApiProperty({
    type: [TransactionResponseDto],
    description: 'Array of transaction responses',
  })
  data: TransactionResponseDto[];

  @ApiProperty({ type: Number, description: 'Total number of transactions' })
  total: number;

  @ApiProperty({ type: Number, description: 'Current page number' })
  page: number;

  @ApiProperty({ type: Number, description: 'Number of transactions per page' })
  limit: number;
}
