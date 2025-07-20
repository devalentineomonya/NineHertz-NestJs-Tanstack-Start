import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class InventoryFilter {
  @ApiPropertyOptional({
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    description: 'Filter by medicine ID',
  })
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Show only low stock items (quantity < reorderThreshold)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStock?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Filter by reorder threshold (quantity < reorderThreshold)',
  })
  @IsOptional()
  @Type(() => Number)
  reorderThreshold?: number;
}
