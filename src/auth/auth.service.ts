import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { logindto } from './login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly dummyHash = bcrypt.hashSync('invalid-login', 10);
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

    const isValid = await bcrypt.compare(data.password!, admin?.password ?? this.dummyHash);

    if (!admin || !isValid) {
      throw new Error('INVALID_PASSWORD');
    }

    const token = await this.jwtservice.signAsync({
      id: admin.id,
      username: admin.username,
    });

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    };
  }
}
