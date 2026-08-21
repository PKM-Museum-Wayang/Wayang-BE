import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';
import { AuthService } from './auth.service';
import { logindto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async handleLogin(
    @Body() body: logindto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authservice.loginService(body);

      response.cookie('access_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Login successful.',
        data: {
          admin: result.admin,
        },
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
        case 'USER_NOT_FOUND':
          throw new UnauthorizedException({
            success: false,
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'User not found.',
          });

        case 'INVALID_PASSWORD':
          throw new UnauthorizedException({
            success: false,
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid username or password.',
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
