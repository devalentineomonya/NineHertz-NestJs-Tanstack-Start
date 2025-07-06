import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePharmacistDto {
  @ApiProperty({ description: 'Full name of the pharmacist' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'License number of the pharmacist' })
  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

  @ApiProperty({ description: 'UUID of the associated user' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'UUID of the associated pharmacy' })
  @IsNotEmpty()
  @IsUUID()
  pharmacyId: string;
}
