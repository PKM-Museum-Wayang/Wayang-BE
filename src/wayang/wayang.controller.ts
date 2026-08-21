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
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';

import { RelasiDto } from './relasi.dto';

import { JwtAuthGuard } from 'src/guards/jwtguard';

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
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: WayangDto) {
    try {
      const data = await this.wayangService.create(body);

      return {
        success: true,
        statusCode: 201,
        message: 'Wayang created successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_REQUEST':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'Invalid request.',
            });

          case 'INVALID_GAYA':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'Invalid gaya.',
            });

          case 'GOLONGAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Golongan not found.',
            });

          case 'PENYIMPANAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Penyimpanan not found.',
            });

          case 'INVALID_GOLONGAN_TYPE':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'Invalid golongan type.',
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

  @Get()
  async findAll(@Query() query: WayangQueryDto) {
    try {
      const data = await this.wayangService.findAll(query);

      return {
        success: true,
        statusCode: 200,
        message: 'Wayang retrieved successfully.',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.wayangService.findOne(Number(id));

      return {
        success: true,
        statusCode: 200,
        message: 'Wayang retrieved successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'WAYANG_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Wayang not found.',
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: WayangDto) {
    try {
      const data = await this.wayangService.update(Number(id), body);

      return {
        success: true,
        statusCode: 200,
        message: 'Wayang updated successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'WAYANG_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Wayang not found.',
            });

          case 'GOLONGAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Golongan not found.',
            });

          case 'PENYIMPANAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Penyimpanan not found.',
            });

          case 'INVALID_GAYA':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'Invalid gaya.',
            });

          case 'INVALID_GOLONGAN_TYPE':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'Invalid golongan type.',
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    try {
      await this.wayangService.remove(Number(id));

      return {
        success: true,
        statusCode: 200,
        message: 'Wayang deleted successfully.',
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'WAYANG_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Wayang not found.',
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

  @Post(':id/media')
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
  async addMedia(
    @Param('id') id: string,
    @Body() body: MediaWayangDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    try {
      const data = await this.wayangService.addMedia(Number(id), body, file);

      return {
        success: true,
        statusCode: 201,
        message: 'Media added successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'WAYANG_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Wayang not found.',
            });

          case 'FILE_REQUIRED':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'File is required.',
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

  @Patch('media/:mediaId')
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
  async updateMedia(
    @Param('mediaId') mediaId: string,
    @Body() body: MediaWayangDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    try {
      const data = await this.wayangService.updateMedia(
        Number(mediaId),
        body,
        file,
      );

      return {
        success: true,
        statusCode: 200,
        message: 'Media updated successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'MEDIA_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Media not found.',
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

  @Delete('media/:mediaId')
  @UseGuards(JwtAuthGuard)
  async removeMedia(@Param('mediaId') mediaId: string) {
    try {
      await this.wayangService.removeMedia(Number(mediaId));

      return {
        success: true,
        statusCode: 200,
        message: 'Media deleted successfully.',
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'MEDIA_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Media not found.',
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

  @Get('media/:mediaId')
  async findMedia(@Param('mediaId') mediaId: string) {
    try {
      const data = await this.wayangService.findMedia(Number(mediaId));

      return {
        success: true,
        statusCode: 200,
        message: 'Media retrieved successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'MEDIA_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Media not found.',
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

  @Get('golongan/:golonganId')
  async findGolongan(@Param('golonganId') golonganId: string) {
    try {
      const data = await this.wayangService.findGolongan(Number(golonganId));

      return {
        success: true,
        statusCode: 200,
        message: 'Golongan retrieved successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'GOLONGAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Golongan not found.',
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

  @Post(':id/relasi')
  @UseGuards(JwtAuthGuard)
  async addRelasi(@Param('id') id: string, @Body() body: RelasiDto) {
    try {
      const data = await this.wayangService.addRelasi(Number(id), body.relasi);

      return {
        success: true,
        statusCode: 200,
        message: 'Wayang relation added successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'WAYANG_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Wayang not found.',
            });

          case 'RELATION_WAYANG_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'One or more related wayang not found.',
            });

          case 'SELF_RELATION_NOT_ALLOWED':
            throw new BadRequestException({
              success: false,
              statusCode: 400,
              message: 'Wayang cannot have a relation with itself.',
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
}
