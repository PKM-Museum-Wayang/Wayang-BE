import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  @Post(':id/gambar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage',

        filename: (req, file, cb) => {
          const unique =
            Date.now() + '-' + Math.random().toString(36).substring(7);

          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async addGambar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    try {
      const data = await this.kegiatanService.addGambar(id, file);

      return {
        success: true,
        statusCode: 201,
        message: 'Gambar kegiatan berhasil ditambahkan.',
        data,
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

        case 'FILE_REQUIRED':
          throw new BadRequestException({
            success: false,
            statusCode: 400,
            message: 'File is required.',
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

  @Delete('gambar/:gambarId')
  @UseGuards(JwtAuthGuard)
  async removeGambar(@Param('gambarId', ParseIntPipe) gambarId: number) {
    try {
      await this.kegiatanService.removeGambar(gambarId);

      return {
        success: true,
        statusCode: 200,
        message: 'Gambar kegiatan berhasil dihapus.',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

}
