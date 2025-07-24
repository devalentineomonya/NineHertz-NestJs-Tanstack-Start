import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  Delete,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RequestWithUser } from 'src/shared/types/request.types';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';

@Roles(Role.ADMIN, Role.PATIENT, Role.PHARMACIST, Role.DOCTOR)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationService.getUserNotifications(
      req.user.sub,
      page,
      limit,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.notificationService.markAsRead(id, req.user.sub);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: RequestWithUser) {
    return this.notificationService.markAllAsRead(req.user.sub);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.notificationService.deleteNotification(id, req.user.sub);
  }
}
