import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwtguard';
import { PesanKontakService } from './pesan-kontak.service';

@Controller('pesan-kontak')
export class PesanKontakController {
  constructor(private readonly service: PesanKontakService) {}

  @Post()
  async create(@Body() body: unknown) {
    return {
      success: true,
      statusCode: 201,
      message: 'Pesan berhasil dikirim.',
      data: await this.service.create(body),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: unknown) {
    return {
      success: true,
      statusCode: 200,
      message: 'Pesan kontak berhasil diambil.',
      ...await this.service.findAll(query),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      success: true,
      statusCode: 200,
      message: 'Pesan kontak berhasil diambil.',
      data: await this.service.findOne(id),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    return {
      success: true,
      statusCode: 200,
      message: 'Pesan kontak berhasil diperbarui.',
      data: await this.service.update(id, body),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true, statusCode: 200, message: 'Pesan kontak berhasil dihapus.' };
  }
}
