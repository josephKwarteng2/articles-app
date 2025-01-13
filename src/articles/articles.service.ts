import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/model/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-articles.dto';
import { User } from 'src/model/user.entity';
import { UpdateArticleDto } from './dto/update-articles.dto';
import { ERROR_MSGS } from 'src/constants/constants';
import { ArticleQueryParams } from './interface/types';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  async createArticle(dto: CreateArticleDto, author: User): Promise<Article> {
    return this.articlesRepository.manager.transaction(async (manager) => {
      try {
        const article = this.articlesRepository.create({
          ...dto,
          author,
          slug: await this.generateSlug(dto.title),
        });
        return await manager.save(article);
      } catch (error) {
        throw error;
      }
    });
  }

  async findAll(
    query: ArticleQueryParams,
  ): Promise<{ articles: Article[]; articlesCount: number }> {
    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .orderBy('article.createdAt', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('article.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      queryBuilder.andWhere('author.username = :username', {
        username: query.author,
      });
    }

    if (query.favorited) {
      queryBuilder
        .innerJoin('article.favoritedBy', 'favoritedBy')
        .andWhere('favoritedBy.username = :username', {
          username: query.favorited,
        });
    }

    const limit = query.limit || 20;
    const offset = query.offset || 0;

    queryBuilder.take(limit).skip(offset);

    const [articles, articlesCount] = await queryBuilder.getManyAndCount();

    return { articles, articlesCount };
  }

  async findOne(id: string): Promise<Article> {
    return this.findArticleById(id);
  }

  async findByUser(userId: string): Promise<Article[]> {
    return this.articlesRepository.find({
      where: { author: { id: userId } },
      relations: ['author'],
    });
  }

  async updateArticle(
    id: string,
    updateArticleDto: UpdateArticleDto,
    user: User,
  ): Promise<Article> {
    const article = await this.findArticleById(id);
    if (article.author.id !== user.id) {
      throw new ForbiddenException(ERROR_MSGS.UNAUTHORIZED_AUTHOR);
    }
    Object.assign(article, updateArticleDto);
    return this.articlesRepository.save(article);
  }

  async deleteArticle(id: string, user: User): Promise<void> {
    const article = await this.findArticleById(id);
    if (article.author.id !== user.id) {
      throw new ForbiddenException(ERROR_MSGS.UNAUTHORIZED_AUTHOR);
    }
    await this.articlesRepository.remove(article);
  }

  async searchArticlesByAuthorOrKeyword(
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ articles: Article[]; articlesCount: number }> {
    const [articles, articlesCount] = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where(
        'to_tsvector(article.title) @@ plainto_tsquery(:query) OR to_tsvector(author.username) @@ plainto_tsquery(:query)',
        { query },
      )
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    return { articles, articlesCount };
  }

  private async findArticleById(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!article) throw new NotFoundException(ERROR_MSGS.ARTICLE_NOT_FOUND);
    return article;
  }

  private async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now()}`;
    return slug;
  }
}
