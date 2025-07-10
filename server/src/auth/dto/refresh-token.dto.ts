import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token string used to obtain a new access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'The token must be a string.' })
  @IsJWT({ message: 'The token must be a valid JWT.' })
  @IsNotEmpty({ message: 'The token field cannot be empty.' })
  refreshToken: string;
}
