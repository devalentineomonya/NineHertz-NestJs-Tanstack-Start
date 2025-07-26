import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/enums/order.enum';
import { PatientResponseDto } from '../../patient/dto/patient-response.dto';
import { OrderItemResponseDto } from './order-item-response.dto';
import { TransactionResponseDto } from 'src/transactions/dto/transaction-response.dto';

export class OrderResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique order ID',
  })
  id: string;

  @ApiProperty({
    example: '2023-08-15T10:30:00.000Z',
    description: 'Order date',
  })
  orderDate: Date;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: 'Order status',
  })
  status: OrderStatus;

  @ApiProperty({
    example: 31.98,
    description: 'Total amount of the order',
  })
  totalAmount: number;

  @ApiProperty({
    type: [TransactionResponseDto],
    description: 'Transaction response',
  })
  transactions: TransactionResponseDto[];

  @ApiProperty({
    type: PatientResponseDto,
    description: 'Patient details',
  })
  patient?: PatientResponseDto;

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: 'Order items',
  })
  items: OrderItemResponseDto[];

  @ApiProperty({
    example: '2023-08-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-08-15T10:35:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
