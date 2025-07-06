import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @ApiPropertyOptional({
    description: 'Indicates whether the prescription has been fulfilled.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isFulfilled?: boolean;
}
