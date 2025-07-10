import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({
    description: 'The new email address of the user',
    example: 'example@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
