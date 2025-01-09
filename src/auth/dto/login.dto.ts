import { IsEmail, IsString } from 'class-validator';
import { DTO_VALIDATIONS } from 'src/constants/constants';

export class LoginDto {
  @IsEmail({}, { message: DTO_VALIDATIONS.INVALID_EMAIL_FORMAT })
  email: string;

  @IsString()
  password: string;
}
