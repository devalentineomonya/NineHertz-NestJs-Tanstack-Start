import { ApiProperty } from '@nestjs/swagger';
import { AdminType } from 'src/enums/admin.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @ApiProperty({
    example: 'Jane Smith-Jones',
    description: 'Updated full name',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    enum: AdminType,
    example: AdminType.SUPER_ADMIN,
    description: 'Updated admin type',
    required: false,
  })
  @IsEnum(AdminType)
  @IsOptional()
  adminType?: AdminType;
}
