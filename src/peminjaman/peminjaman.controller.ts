import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';

import { PeminjamanService } from './peminjaman.service';
import { CreatePeminjamanDto } from './peminjam.dto';

@Controller('peminjaman')
export class PeminjamanController {
  constructor(private readonly peminjamanService: PeminjamanService) {}

  @Post()
  async create(@Body() body: CreatePeminjamanDto) {
    try {
      const data = await this.peminjamanService.create(body);

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Loan created.',
        data,
      };
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      switch (error.message) {
        case 'INVALID_DATE':
          throw new BadRequestException({
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid dates.',
          });

        case 'WAYANG_NOT_FOUND':
          throw new NotFoundException({
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Wayang not found.',
          });

        case 'WAYANG_UNAVAILABLE':
          throw new BadRequestException({
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Wayang unavailable.',
          });

        default:
          throw new HttpException(
            {
              success: false,
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Internal server error.',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }
}
