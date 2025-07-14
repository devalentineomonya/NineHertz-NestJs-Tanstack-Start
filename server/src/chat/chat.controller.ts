// src/chat/chat.controller.ts
import { Body, Controller, Header, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async create(
    @Body() createChatDto: CreateChatDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = req.headers['x-forwarded-for']?.[0] || req.ip || '127.0.0.1';
    return this.chatService.handleRequest(ip, createChatDto, res);
  }
}
