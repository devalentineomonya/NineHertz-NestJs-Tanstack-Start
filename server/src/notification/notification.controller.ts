import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  Delete,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RequestWithUser } from 'src/shared/types/request.types';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { TestNotificationDto } from './dto/test-notification.dto';
import { CreateNotificationDto } from './dto/cerate-notification.dto';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import { Public } from 'src/auth/decorators/public.decorators';

@Roles(Role.ADMIN, Role.PATIENT, Role.PHARMACIST, Role.DOCTOR)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post('push/test')
  async testNotification(
    @Body() dto: TestNotificationDto,
    @Req() req: RequestWithUser,
  ) {
    await this.notificationService.triggerTestNotification(req.user.sub, dto);
    return { success: true, message: 'Test notification sent' };
  }

  @Post('push/subscribe')
  @Public()
  async subscribeToPush(@Body() dto: PushSubscriptionDto) {
    return this.notificationService.subscribeToPush({
      ...dto,
      userId: dto.userId,
    });
  }

  @Public()
  @Post('push/unsubscribe')
  async unsubscribeFromPush(
    @Body() { endpoint, userId }: { endpoint: string; userId: string },
  ) {
    return this.notificationService.unsubscribeFromPush(userId, endpoint);
  }

  // WhatsApp Notification Endpoint
  @Post('whatsapp')
  async sendWhatsApp(
    @Body() dto: CreateNotificationDto,
    @Req() req: RequestWithUser,
  ) {
    if (!dto.userPhone) throw new BadRequestException('Phone number required');
    return this.notificationService.sendWhatsAppNotification(
      req.user.sub,
      dto.userPhone,
      dto,
    );
  }

  // Bulk Notification Endpoint
  @Post('bulk')
  async sendBulkNotifications(
    @Body() { userIds, ...dto }: { userIds: string[] } & CreateNotificationDto,
  ) {
    return this.notificationService.triggerPusherEvents(userIds, dto);
  }

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
  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: RequestWithUser) {
    return this.notificationService.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.notificationService.markAsRead(id, req.user.sub);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.notificationService.deleteNotification(id, req.user.sub);
  }
}
