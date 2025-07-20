import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { OrderStatus } from 'src/enums/order.enum';

export class OrderFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by patient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid patient ID format' })
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter orders from this date (ISO format)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'fromDate must be a valid ISO date string' })
  @ValidateIf((o: OrderFilterDto) => !!o.toDate)
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter orders until this date (ISO format)',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'toDate must be a valid ISO date string' })
  @ValidateIf((o: OrderFilterDto) => !!o.fromDate)
  toDate?: string;
}
