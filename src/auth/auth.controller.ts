import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { logindto } from './login.dto';
import { JwtAuthGuard } from '../guards/jwtguard';

@Controller('auth')
export class AuthController {
  // shortcut: per-process limit, use a shared store when running multiple instances.
  private readonly attempts = new Map<string, { count: number; expires: number }>();
  constructor(private readonly authservice: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async handleLogin(
    @Body() body: logindto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const now = Date.now();
    for (const [key, value] of this.attempts) {
      if (value.expires <= now) this.attempts.delete(key);
    }
    const key = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    let attempt = this.attempts.get(key);
    if (!attempt) {
      if (this.attempts.size >= 10000) {
        throw new HttpException('Terlalu banyak percobaan login.', HttpStatus.TOO_MANY_REQUESTS);
      }
      attempt = { count: 0, expires: now + 15 * 60 * 1000 };
      this.attempts.set(key, attempt);
    }
    if (attempt.count >= 10) {
      throw new HttpException('Terlalu banyak percobaan login. Coba lagi nanti.', HttpStatus.TOO_MANY_REQUESTS);
    }
    attempt.count++;
    try {
      if (typeof body?.username !== 'string' || typeof body?.password !== 'string' || !body.username || !body.password) {
        throw new Error('INVALID_PASSWORD');
      }
      const result = await this.authservice.loginService(body);
      this.attempts.delete(key);

      response.cookie('access_token', result.token, {
        httpOnly: true,
        // Deployment saat ini belum ada TLS di depan backend/frontend, jadi
        // cookie Secure tidak akan pernah disimpan browser (dan bikin login
        // "sukses" tapi request selanjutnya kelihatan belum login). Set
        // COOKIE_SECURE=true di env begitu sudah ada HTTPS.
        secure: process.env.COOKIE_SECURE === 'true',
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

  @Get('session')
  @UseGuards(JwtAuthGuard)
  session(@Req() request: Request) {
    return { data: { admin: request.user } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
    });
    return { success: true, message: 'Logout successful.' };
  }
}
