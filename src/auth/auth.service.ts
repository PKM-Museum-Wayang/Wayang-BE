import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { logindto } from './login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwtservice: JwtService,
  ) {}
  async loginService(data: logindto) {
    const admin = await this.database.admin.findFirst({
      where: {
        username: data.username,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Not found');
    } else {
      const isValid = await bcrypt.compare(data.password!, admin.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid');
      } else {
        const token = await this.jwtservice.signAsync({
          id: admin.id,
          username: admin.username,
        });
        return {
          message: 'Login success',
          token: token,
          data: {
            id: admin.id,
            username: admin.username,
          },
        };
      }
    }
  }
}
