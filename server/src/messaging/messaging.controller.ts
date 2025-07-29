import { Controller, Post, Body, Param, Get, Req } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { RequestWithUser } from 'src/shared/types/request.types';

@Controller('messaging')
@Roles(Role.PATIENT, Role.ADMIN, Role.PHARMACIST, Role.DOCTOR)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('appointment')
  async createChatForAppointment(@Body() body: { appointmentId: string }) {
    return this.messagingService.createChatForAppointment(body.appointmentId);
  }

  @Get('user/:userId/profile')
  async getUserProfile(@Param('userId') userId: string) {
    return this.messagingService.getUserProfile(userId);
  }

  @Post(':chatId/mark-read')
  async markMessagesAsRead(
    @Param('chatId') chatId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.messagingService.markMessagesAsRead(chatId, req.user.sub);
    return { success: true };
  }

  @Get('user/my-chats')
  async getMyChats(@Req() req: RequestWithUser) {
    return this.messagingService.getChatsByUser(req.user.sub);
  }
}
