import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../guards/jwtguard';
import { BiografiService } from './biografi.service';

const FotoProfilInterceptor = FileInterceptor('fotoProfil', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 12 },
});

@Controller('biografi')
export class BiografiController {
  constructor(private readonly biografiService: BiografiService) {}

  @Get()
  async findOne() {
    return {
      success: true,
      statusCode: 200,
      message: 'Biografi retrieved successfully.',
      data: await this.biografiService.findOne(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FotoProfilInterceptor)
  async create(@Body() body: unknown, @UploadedFile() file?: Express.Multer.File) {
    return {
      success: true,
      statusCode: 201,
      message: 'Biografi created successfully.',
      data: await this.biografiService.create(body, file),
    };
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FotoProfilInterceptor)
  async update(
    @Body() body: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return {
      success: true,
      statusCode: 200,
      message: 'Biografi updated successfully.',
      data: await this.biografiService.update(body, file),
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove() {
    await this.biografiService.remove();
    return {
      success: true,
      statusCode: 200,
      message: 'Biografi deleted successfully.',
    };
  }
}
