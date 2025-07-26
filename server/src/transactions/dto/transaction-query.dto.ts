import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Gateway, TransactionStatus } from '../entities/transaction.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionQueryDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  @ApiPropertyOptional({ enum: TransactionStatus })
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(Gateway)
  @ApiPropertyOptional({ enum: Gateway })
  gateway?: Gateway;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  toDate?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: String })
  userId?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: String })
  orderId?: string;

  @IsOptional()
  @ApiPropertyOptional({ type: String })
  appointmentId?: string;
}
