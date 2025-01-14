import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class ArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  @IsNotEmpty()
  tagList: string[];
}
