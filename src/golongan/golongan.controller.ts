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

import { GolonganService } from './golongan.service';
import { JwtAuthGuard } from 'src/guards/jwtguard';

export class CreateGolonganDto {
  namaGolongan?: string;
  tipeGolongan?: string;
}

export class UpdateGolonganDto {
  namaGolongan?: string;
  tipeGolongan?: string;
}

export class GolonganQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  tipeGolongan?: string;
}

@Controller('golongan')
export class GolonganController {
  constructor(private readonly golonganService: GolonganService) {}

  @Get('all')
  async findAllWithoutPagination(@Query('tipeGolongan') tipeGolongan?: string) {
    try {
      const data =
        await this.golonganService.findAllWithoutPagination(tipeGolongan);

      return {
        success: true,
        statusCode: 200,
        message: 'All golongan retrieved successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  async findAll(@Query() query: GolonganQueryDto) {
    try {
      const data = await this.golonganService.findAll(query);

      return {
        success: true,
        statusCode: 200,
        message: 'Golongan retrieved successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.golonganService.findOne(id);

      return {
        success: true,
        statusCode: 200,
        message: 'Golongan retrieved successfully.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }



  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateGolonganDto) {
    try {
      const data = await this.golonganService.create(dto);

      return {
        success: true,
        statusCode: 201,
        message: 'Golongan created successfully.',
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
    @Body() dto: UpdateGolonganDto,
  ) {
    try {
      const data = await this.golonganService.update(id, dto);

      return {
        success: true,
        statusCode: 200,
        message: 'Golongan updated successfully.',
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
      await this.golonganService.remove(id);

      return {
        success: true,
        statusCode: 200,
        message: 'Golongan deleted successfully.',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      switch (error.message) {
        case 'GOLONGAN_NOT_FOUND':
          throw new NotFoundException({
            success: false,
            statusCode: 404,
            message: 'Golongan not found.',
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
