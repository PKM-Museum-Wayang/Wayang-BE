import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),

      secretOrKey: config.get<string>('SECRET_KEY')!,
    });
  }

  validate(payload: any) {
    if (typeof payload.exp !== 'number') {
      throw new UnauthorizedException();
    }
    return {
      id: payload.id,
      username: payload.username,
    };
  }
}
