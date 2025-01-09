import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentsDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class UpdateCommentsDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}
