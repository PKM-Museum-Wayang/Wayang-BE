import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { logindto } from './login.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}
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
        return {
          message: 'Login success',
          data: {
            id: admin.id,
            username: admin.username,
          },
        };
      }
    }
  }
}
