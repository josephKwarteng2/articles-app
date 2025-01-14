import { Controller, Get, Body, Req, UseGuards, Patch } from '@nestjs/common';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard/jwt-auth.guard';
import { UpdateProfileDto } from 'src/auth/dto/update-profile.dto';
import { ApiResponse, UserResponse } from 'src/utils/utils';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<ApiResponse<UserResponse>> {
    const user = req.user;
    return { data: { user } };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ApiResponse<UserResponse>> {
    const updatedUser = await this.usersService.update(req.user.id, updateData);
    return { data: { user: updatedUser } };
  }
}
