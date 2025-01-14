import { IsString, IsNotEmpty } from 'class-validator';

export class CommentsDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}
