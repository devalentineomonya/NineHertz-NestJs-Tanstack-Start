import {
  Controller,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { StreamService } from './stream.service';
// import { CreateStreamDto } from './dto/create-stream.dto';
// import { UpdateStreamDto } from './dto/update-stream.dto';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  // @Post()
  // create(@Body() createStreamDto: CreateStreamDto) {
  //   return this.streamService.create(createStreamDto);
  // }

  // @Get()
  // findAll() {
  //   return this.streamService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.streamService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStreamDto: UpdateStreamDto) {
  //   return this.streamService.update(+id, updateStreamDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.streamService.remove(+id);
  // }
}
