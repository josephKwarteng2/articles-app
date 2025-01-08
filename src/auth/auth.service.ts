import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from 'src/model/user.entity';
import { TOAST_MSGS } from 'src/constants/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException(TOAST_MSGS.INVALID_CREDENTIALS);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException(TOAST_MSGS.INVALID_CREDENTIALS);

    return user;
  }

  async login(user: User) {
    const payload = { user: { id: user.id, email: user.email } };
    const { password, ...userData } = user;
    return {
      data: {
        access_token: this.jwtService.sign(payload),
        user: userData,
      },
    };
  }

  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<{ data: { user: User } }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
    });
    return {
      data: {
        user,
      },
    };
  }

  async getUserProfile(userId: number): Promise<User> {
    return this.usersService.findById(userId);
  }

  async updateUserProfile(
    userId: number,
    updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(userId, updateData);
  }
}
