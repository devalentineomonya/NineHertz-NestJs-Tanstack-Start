import { IsArray, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'The role of the sender, e.g., "user" or "assistant"',
    example: 'user',
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'The actual message content',
    example: 'Hello, how can I help you today?',
  })
  @IsString()
  content: string;
}

export class CreateChatDto {
  @ApiProperty({
    description: 'Array of messages between user and assistant',
    type: [MessageDto],
  })
  @IsArray()
  @IsObject({ each: true })
  messages: MessageDto[];
}
