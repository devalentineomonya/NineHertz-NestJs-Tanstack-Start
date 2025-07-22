import { Body, Controller, Header, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { RequestWithUser } from 'src/shared/types/request.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.DOCTOR, Role.PATIENT, Role.PHARMACIST, Role.ADMIN)
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async create(
    @Body() createChatDto: CreateChatDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const ip = req.headers['x-forwarded-for']?.[0] || req.ip || '127.0.0.1';
    const userId = req.user?.sub;
    await this.chatService.handleRequest(ip, createChatDto, res, userId);
  }
}
