import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDecimal,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from 'src/enums/order.enum';

class UpdateOrderItemDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Order item ID (for existing items)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Medicine ID (for new items)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  medicineId?: string;

  @ApiProperty({
    example: 3,
    description: 'Updated quantity',
    required: false,
  })
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    example: 15.99,
    description: 'Updated price per unit',
    required: false,
  })
  @IsOptional()
  pricePerUnit?: number;
}

export class UpdateOrderDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: 'Updated order status',
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    example: 47.97,
    description: 'Updated total amount',
    required: false,
  })
  @IsDecimal()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    type: [UpdateOrderItemDto],
    description: 'Updated order items',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  items?: UpdateOrderItemDto[];

  @ApiProperty({
    example: 'pi_3Lt2Fd2eZvKYlo2C0HX2e1',
    description: 'Stripe payment ID',
    required: false,
  })
  @IsOptional()
  stripePaymentId?: string;

  @ApiProperty({
    example: '5q7w8e9r',
    description: 'Paystack reference',
    required: false,
  })
  @IsOptional()
  paystackReference?: string;

  @ApiProperty({
    example: 'paid',
    description: 'Payment status',
    enum: ['unpaid', 'paid', 'refunded'],
    required: false,
  })
  @IsOptional()
  paymentStatus?: string;
}
