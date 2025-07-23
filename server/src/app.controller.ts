import { Controller, Head } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Head()
  handleHeadRequest(): boolean {
    return true;
  }
}
