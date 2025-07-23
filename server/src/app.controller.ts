import { Controller, Get, Head } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorators';

@Controller()
export class AppController {
  @Public()
  @Head()
  handleHeadRequest(): { success: boolean } {
    return { success: true };
  }
  @Public()
  @Get()
  handleGetRequest(): { success: boolean } {
    return { success: true };
  }
}
