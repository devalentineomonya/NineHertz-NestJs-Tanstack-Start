import { ApiProperty } from '@nestjs/swagger';
import { MedicineResponseDto } from '../../medicine/dto/medicine-response.dto';
export class InventoryItemResponseDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Unique inventory item ID',
  })
  id: string;

  @ApiProperty({
    example: 100,
    description: 'Current quantity in stock',
  })
  quantity: number;

  @ApiProperty({
    example: 20,
    description: 'Reorder threshold',
  })
  reorderThreshold: number;

  @ApiProperty({
    example: '2023-08-15T10:00:00.000Z',
    description: 'Last restocked date',
  })
  lastRestocked: Date;

  @ApiProperty({
    type: MedicineResponseDto,
    description: 'Medicine details',
  })
  medicine: MedicineResponseDto;
}
