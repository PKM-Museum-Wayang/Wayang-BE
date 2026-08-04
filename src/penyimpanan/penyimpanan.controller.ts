import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PenyimpananService } from './penyimpanan.service';
import { PenyimpananDto } from './penyimpanan.dto';

@Controller('penyimpanan')
export class PenyimpananController {
  constructor(private readonly service: PenyimpananService) {}

  @Post()
  create(@Body() body: PenyimpananDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: PenyimpananDto) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
