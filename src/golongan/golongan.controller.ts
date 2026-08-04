import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

import { GolonganService } from './golongan.service';

@Controller('golongan')
export class GolonganController {
  constructor(private readonly golonganService: GolonganService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.golonganService.findAll();

      return {
        success: true,
        statusCode: 200,
        message: 'Golongan retrieved successfully.',
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
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
}
