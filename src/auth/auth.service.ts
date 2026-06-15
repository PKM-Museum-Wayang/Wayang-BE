import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { logindto } from './login.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}
  async loginService(data: logindto) {
    const password = await bcrypt.hash(data.password!, 10);
    const admin = this.database.admin.findFirst({
      where: {
        username: data.username,
        password: password,
      },
    });
    return admin;
  }
}
