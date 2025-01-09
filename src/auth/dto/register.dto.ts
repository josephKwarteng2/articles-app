import { IsEmail, IsString, MinLength } from 'class-validator';
import { DTO_VALIDATIONS } from 'src/constants/constants';

export class RegisterDto {
  @IsEmail({}, { message: DTO_VALIDATIONS.INVALID_EMAIL_FORMAT })
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString({ message: DTO_VALIDATIONS.INVALID_PASSWORD_FORMAT })
  @MinLength(6)
  password: string;
}
