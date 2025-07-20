import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
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
