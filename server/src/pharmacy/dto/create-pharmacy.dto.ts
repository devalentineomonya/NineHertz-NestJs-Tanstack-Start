import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePharmacyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  licenseNumber: string;
}
