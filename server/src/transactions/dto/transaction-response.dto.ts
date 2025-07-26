import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gateway, TransactionStatus } from '../entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: Gateway })
  gateway: Gateway;

  @ApiProperty()
  gatewayReference: string;

  @ApiPropertyOptional()
  gatewayFees?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  refundReason?: string;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, any>;

  // Relationships (optional in response)
  @ApiPropertyOptional()
  orderId?: string;

  @ApiPropertyOptional()
  appointmentId?: string;

  @ApiPropertyOptional()
  userId?: string;
}
