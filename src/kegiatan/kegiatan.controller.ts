import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  CreateKegiatanDto,
  UpdateKegiatanDto,
  KegiatanQueryDto,
} from './kegiatan.dto';

import { KegiatanService } from './kegiatan.service';

import { JwtAuthGuard } from 'src/guards/jwtguard';

@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  @Get()
  async findAll(@Query() query: KegiatanQueryDto) {
    try {
      const data = await this.kegiatanService.findAll(query);

      return {
        success: true,
        statusCode: 200,
        message: 'Kegiatan retrieved successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.kegiatanService.findOne(id);

      return {
        success: true,
        statusCode: 200,
        message: 'Kegiatan retrieved successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateKegiatanDto) {
    try {
      const data = await this.kegiatanService.create(dto);

      return {
        success: true,
        statusCode: 201,
        message: 'Kegiatan created successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKegiatanDto,
  ) {
    try {
      const data = await this.kegiatanService.update(id, dto);

      return {
        success: true,
        statusCode: 200,
        message: 'Kegiatan updated successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.kegiatanService.remove(id);

      return {
        success: true,
        statusCode: 200,
        message: 'Kegiatan deleted successfully.',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      switch (error.message) {
        case 'KEGIATAN_NOT_FOUND':
          throw new NotFoundException({
            success: false,
            statusCode: 404,
            message: 'Kegiatan not found.',
          });

        case 'ADMIN_NOT_FOUND':
          throw new NotFoundException({
            success: false,
            statusCode: 404,
            message: 'Admin not found.',
          });

        case 'DATABASE_ERROR':
          throw new InternalServerErrorException({
            success: false,
            statusCode: 500,
            message: 'Database error.',
          });

        default:
          throw new InternalServerErrorException({
            success: false,
            statusCode: 500,
            message: 'Internal server error.',
          });
      }
    }

    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message: 'Internal server error.',
    });
  }
}
