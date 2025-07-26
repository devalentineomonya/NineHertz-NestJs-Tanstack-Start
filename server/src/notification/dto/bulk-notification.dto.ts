import { IsArray, IsString } from 'class-validator';
import { CreateNotificationDto } from './cerate-notification.dto';

export class BulkNotificationDto extends CreateNotificationDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
