import { AuthorDto } from './author-dto';

export class SanitizedArticleDto {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  author: AuthorDto;
}
