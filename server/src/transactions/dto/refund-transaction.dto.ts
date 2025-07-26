import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundTransactionDto {
  @ApiProperty({
    description: 'The unique identifier of the transaction to be refunded',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiPropertyOptional({
    description: 'The reason for the refund',
    example: 'Product defect',
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata related to the refund',
    example: { key: 'value' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
