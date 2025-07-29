import { PartialType } from '@nestjs/swagger';
import { CreateMessagingDto } from './create-messaging.dto';

export class UpdateMessagingDto extends PartialType(CreateMessagingDto) {}
