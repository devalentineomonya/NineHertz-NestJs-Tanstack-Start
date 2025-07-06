import { PartialType } from '@nestjs/swagger';
import { CreatePharmacistDto } from './create-pharmacist.dto';

export class UpdatePharmacistDto extends PartialType(CreatePharmacistDto) {}
