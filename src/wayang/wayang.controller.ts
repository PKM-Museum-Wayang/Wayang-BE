import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { WayangService } from './wayang.service';
import { MediaWayangDto } from './mediawayang.dto';
import { WayangDto } from './wayang,.dto';
import { WayangQueryDto } from './wayangquery.dto';
@Controller('wayang')
export class WayangController {
  constructor(private readonly wayangService: WayangService) {}

  @Post()
  create(@Body() body: WayangDto) {
    return this.wayangService.create(body);
  }

  @Post(':id/media')
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
  addMedia(
    @Param('id') id: string,
    @Body() body: MediaWayangDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.wayangService.addMedia(Number(id), body, file);
  }

  @Get()
  findAll(@Query() query: WayangQueryDto) {
    return this.wayangService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wayangService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: WayangDto) {
    return this.wayangService.update(Number(id), body);
  }

  @Patch('media/:mediaId')
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
  updateMedia(
    @Param('mediaId') mediaId: string,
    @Body() body: MediaWayangDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.wayangService.updateMedia(Number(mediaId), body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wayangService.remove(Number(id));
  }
  @Delete('media/:mediaId')
  removeMedia(@Param('mediaId') mediaId: string) {
    return this.wayangService.removeMedia(Number(mediaId));
  }

  @Get('media/:mediaId')
  findMedia(@Param('mediaId') mediaId: string) {
    return this.wayangService.findMedia(Number(mediaId));
  }

  @Get('golongan/:golonganId')
  findGolongan(@Param('golonganId') golonganId: string) {
    return this.wayangService.findGolongan(Number(golonganId));
  }

  @Get('penyimpanan/:penyimpananId')
  findPenyimpanan(@Param('penyimpananId') penyimpananId: string) {
    return this.wayangService.findPenyimpanan(Number(penyimpananId));
  }
}
