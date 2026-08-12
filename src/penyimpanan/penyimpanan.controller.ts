import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PenyimpananService } from './penyimpanan.service';
import { PenyimpananDto } from './penyimpanan.dto';

@Controller('penyimpanan')
export class PenyimpananController {
  constructor(private readonly service: PenyimpananService) {}

  @Post()
  async create(@Body() body: PenyimpananDto) {
    try {
      const data = await this.service.create(body);

      return {
        success: true,
        statusCode: 201,
        message: 'Storage created successfully.',
        data,
      };
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message: 'Internal server error.',
      });
    }
  }

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();

      return {
        success: true,
        statusCode: 200,
        message: 'Storage retrieved successfully.',
        data,
      };
    } catch {
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
      const data = await this.service.findOne(Number(id));

      return {
        success: true,
        statusCode: 200,
        message: 'Storage retrieved successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'PENYIMPANAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Storage not found.',
            });

          case 'DATABASE_ERROR':
            throw new InternalServerErrorException({
              success: false,
              statusCode: 500,
              message: 'Database error.',
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
  async update(@Param('id') id: string, @Body() body: PenyimpananDto) {
    try {
      const data = await this.service.update(Number(id), body);

      return {
        success: true,
        statusCode: 200,
        message: 'Storage updated successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'PENYIMPANAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Storage not found.',
            });

          case 'DATABASE_ERROR':
            throw new InternalServerErrorException({
              success: false,
              statusCode: 500,
              message: 'Database error.',
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
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(Number(id));

      return {
        success: true,
        statusCode: 200,
        message: 'Storage deleted successfully.',
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'PENYIMPANAN_NOT_FOUND':
            throw new NotFoundException({
              success: false,
              statusCode: 404,
              message: 'Storage not found.',
            });

          case 'DATABASE_ERROR':
            throw new InternalServerErrorException({
              success: false,
              statusCode: 500,
              message: 'Database error.',
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
