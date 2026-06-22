import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class logindto {
  username?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}
  @Post('login')
  @HttpCode(200)
  async HandleLogin(@Body() body: logindto) {
    const data = await this.authservice.loginService(body);
    if (data) {
      return data;
    }
  }
}
