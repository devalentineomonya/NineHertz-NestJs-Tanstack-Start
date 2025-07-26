import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gateway } from '../entities/transaction.entity';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'The payment provider',
    enum: Gateway,
    example: Gateway.STRIPE,
  })
  @IsEnum(Gateway)
  gateway: Gateway;

  @ApiProperty({
    description: 'The payment amount',
    example: 1000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'The payment description',
    example: 'Payment for healthcare services',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The customer email address',
    example: 'customer@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: 'The order ID associated with the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  orderId?: string;

  @ApiProperty({
    description: 'The appointment ID associated with the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  appointmentId?: string;
}
