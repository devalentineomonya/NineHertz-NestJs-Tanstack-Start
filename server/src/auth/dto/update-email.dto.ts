import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
  @ApiProperty({
    description: 'The new email address of the user',
    example: 'example@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
