import { ApiProperty } from '@nestjs/swagger';
import { MedicineResponseDto } from 'src/medicine/dto/medicine-response.dto';
export class OrderItemResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique order item ID',
  })
  id: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity ordered',
  })
  quantity: number;

  @ApiProperty({
    example: 15.99,
    description: 'Price per unit at the time of order',
  })
  pricePerUnit: number;

  @ApiProperty({
    type: MedicineResponseDto,
    description: 'Medicine details',
  })
  medicine: MedicineResponseDto;
}
