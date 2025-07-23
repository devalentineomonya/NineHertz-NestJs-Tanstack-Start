import { Controller, Get, Head } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorators';

@Controller()
export class AppController {
  @Public()
  @Head()
  handleHeadRequest(): boolean {
    return true;
  }
  @Public()
  @Get()
  handleGetRequest(): boolean {
    return true;
  }
}
