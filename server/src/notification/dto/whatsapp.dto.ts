import { IsPhoneNumber } from 'class-validator';
import { CreateNotificationDto } from './cerate-notification.dto';

export class WhatsAppNotificationDto extends CreateNotificationDto {
  @IsPhoneNumber()
  declare userPhone: string;
}
