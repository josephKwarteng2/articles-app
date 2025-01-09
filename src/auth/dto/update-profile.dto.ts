import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { DTO_VALIDATIONS } from 'src/constants/constants';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: DTO_VALIDATIONS.INVALID_EMAIL_FORMAT })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  image: string;
}
