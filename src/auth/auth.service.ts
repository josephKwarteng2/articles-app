import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from 'src/model/user.entity';
import { TOAST_MSGS } from 'src/constants/constants';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email,
        username,
        password: hashedPassword,
      });
      await queryRunner.commitTransaction();
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Registration failed');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  async updateUserProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(userId, updateData);
  }
}
