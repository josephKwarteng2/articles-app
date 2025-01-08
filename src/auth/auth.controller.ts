import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { User } from 'src/model/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() reqBody: RegisterDto,
  ): Promise<{ data: { user: User } }> {
    return this.authService.register(
      reqBody.email,
      reqBody.username,
      reqBody.password,
    );
  }

  @Post('login')
  async login(@Body() reqBody: LoginDto) {
    const user = await this.authService.validateUser(
      reqBody.email,
      reqBody.password,
    );
    return this.authService.login(user);
  }
}
