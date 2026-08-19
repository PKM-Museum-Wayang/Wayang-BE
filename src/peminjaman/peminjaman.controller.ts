import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PeminjamanService } from './peminjaman.service';
import {
  CreatePeminjamanDto,
  UpdatePeminjamanDto,
  PeminjamanQueryDto,
} from './peminjam.dto';

import { JwtAuthGuard } from 'src/guards/jwtguard';

@Controller('peminjaman')
@UseGuards(JwtAuthGuard)
export class PeminjamanController {
  private readonly logger = new Logger(PeminjamanController.name);

  constructor(private readonly peminjamanService: PeminjamanService) {}

  @Post()
  async create(@Body() body: CreatePeminjamanDto) {
    try {
      this.logger.log(`Create peminjaman: ${JSON.stringify(body)}`);

      const data = await this.peminjamanService.create(body);

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Loan created.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  async findAll(@Query() query: PeminjamanQueryDto) {
    try {
      const data = await this.peminjamanService.findAll(query);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Loans retrieved.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.peminjamanService.findOne(id);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Loan retrieved.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePeminjamanDto,
  ) {
    try {
      const data = await this.peminjamanService.update(id, body);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Loan updated.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.peminjamanService.remove(id);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Loan deleted.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id/return')
  async returnLoan(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.peminjamanService.returnLoan(id);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Loan returned.',
        data,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    console.error('========================================');
    console.error('PEMINJAMAN ERROR:', error);
    console.error('========================================');

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

      case 'LOAN_NOT_FOUND':
        throw new NotFoundException({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Loan not found.',
        });

      case 'LOAN_ALREADY_RETURNED':
        throw new BadRequestException({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Loan already returned.',
        });

      default:
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message || 'Internal server error.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
