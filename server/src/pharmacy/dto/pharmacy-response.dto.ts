import { ApiProperty } from '@nestjs/swagger';

export class PharmacyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  contactPhone: string;

  @ApiProperty()
  licenseNumber: string;

  @ApiProperty({ type: [String] })
  inventoryIds: string[];

  @ApiProperty({ type: [String] })
  orderIds: string[];

  @ApiProperty({ type: [String] })
  pharmacistIds: string[];

  constructor(partial: Partial<PharmacyResponseDto>) {
    Object.assign(this, partial);
  }
}
