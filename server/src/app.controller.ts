import { Controller, Get, Head } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Head()
  handleHeadRequest(): boolean {
    return true;
  }
  @Get()
  handleGetRequest(): boolean {
    return true;
  }
}
