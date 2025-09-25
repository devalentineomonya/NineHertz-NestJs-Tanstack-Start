import { Body, Controller, Get, Ip, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { RequestWithUser } from 'src/shared/types/request.types';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.DOCTOR, Role.PATIENT, Role.PHARMACIST, Role.ADMIN)
  async create(
    @Body() createChatDto: CreateChatDto,
    @Ip() userIp: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const ip = req.headers['x-forwarded-for']?.[0] || userIp || '127.0.0.1';
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    console.log(req.body);
    await this.chatService.handleRequest({
      ip,
      createChatDto,
      res,
      userId,
      userRole,
    });
  }

  @Public()
  @Get()
  async test() {
    await this.chatService.testModel();
  }
}
