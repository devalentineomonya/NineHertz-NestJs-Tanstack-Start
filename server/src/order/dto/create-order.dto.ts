import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { OrderStatus } from 'src/enums/order.enum';

class CreateOrderItemDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Medicine ID',
  })
  @IsUUID()
  medicineId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of medicine',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 15.99,
    description: 'Price per unit at the time of order',
  })
  @IsNumber()
  @Min(0.01)
  pricePerUnit: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Patient ID',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Pharmacy ID',
  })
  @IsUUID()
  pharmacyId: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Order items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  items: CreateOrderItemDto[];

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Order status',
    default: OrderStatus.PENDING,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    example: 31.98,
    description: 'Total amount of the order',
  })
  @IsNumber()
  @Min(0.01)
  totalAmount: number;
}
