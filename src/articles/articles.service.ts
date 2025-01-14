import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/model/article.entity';
import { Repository } from 'typeorm';
import { ArticleDto } from './dto/create-articles.dto';
import { User } from 'src/model/user.entity';
import { UpdateArticleDto } from './dto/update-articles.dto';
import { ERROR_MSGS, TOAST_MSGS } from 'src/constants/constants';
import { ArticleQueryParams } from './interface/types';
import { RELATIONS } from 'src/constants/constants';
import { applyFilters } from 'src/utils/utils';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  public async createArticle(
    dto: ArticleDto,
    author: User,
  ): Promise<{ data: { article: Article } }> {
    try {
      const article = this.articlesRepository.create({ ...dto, author });
      await this.articlesRepository.save(article);
      return { data: { article } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async findAll(
    query: ArticleQueryParams,
  ): Promise<{ data: { articles: Article[]; articlesCount: number } }> {
    const { tag, author, favorited, limit = 20, offset = 0 } = query;
    const queryBuilder = this.articlesRepository
      .createQueryBuilder(RELATIONS.ARTICLE)
      .leftJoinAndSelect(
        `${RELATIONS.ARTICLE}.${RELATIONS.AUTHOR}`,
        RELATIONS.AUTHOR,
      )
      .leftJoinAndSelect(
        `${RELATIONS.ARTICLE}.${RELATIONS.COMMENTS}`,
        RELATIONS.COMMENTS,
      )
      .leftJoinAndSelect(
        `${RELATIONS.COMMENTS}.${RELATIONS.AUTHOR}`,
        RELATIONS.COMMENT_AUTHOR,
      )
      .orderBy('article.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    applyFilters(queryBuilder, {
      'article.tagList LIKE :tag': tag && `%${tag}%`,
      'author.username = :username': author,
    });

    if (favorited) {
      queryBuilder
        .innerJoin('article.favoritedBy', 'favoritedBy')
        .andWhere('favoritedBy.username = :username', { username: favorited });
    }

    const [articles, articlesCount] = await queryBuilder.getManyAndCount();
    return { data: { articles, articlesCount } };
  }

  public async searchArticlesByAuthorOrKeyword(
    query: string,
    limit: number,
    offset: number,
  ): Promise<{ data: { articles: Article[]; articlesCount: number } }> {
    try {
      const queryBuilder = this.articlesRepository
        .createQueryBuilder(RELATIONS.ARTICLE)
        .leftJoinAndSelect(
          `${RELATIONS.ARTICLE}.${RELATIONS.AUTHOR}`,
          RELATIONS.AUTHOR,
        )
        .leftJoinAndSelect(
          `${RELATIONS.ARTICLE}.${RELATIONS.COMMENTS}`,
          RELATIONS.COMMENTS,
        )
        .leftJoinAndSelect(
          `${RELATIONS.COMMENTS}.${RELATIONS.AUTHOR}`,
          RELATIONS.COMMENT_AUTHOR,
        )
        .where('article.title LIKE :query OR article.body LIKE :query', {
          query: `%${query}%`,
        })
        .orderBy('article.createdAt', 'DESC')
        .skip(offset)
        .take(limit);

      const [articles, articlesCount] = await queryBuilder.getManyAndCount();

      return { data: { articles, articlesCount } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async likeArticle(
    articleId: string,
    user: User,
  ): Promise<{ message: string }> {
    try {
      const article = await this.articlesRepository.findOne({
        where: { id: articleId },
        relations: ['favoritedBy'],
      });
      if (!article.favoritedBy.some(({ id }) => id === user.id)) {
        article.favoritedBy.push(user);
        article.favoritesCount = article.favoritedBy.length;
        await this.articlesRepository.save(article);
      }
      return { message: TOAST_MSGS.ARTICLE_LIKED };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async unlikeArticle(
    articleId: string,
    user: User,
  ): Promise<{ message: string }> {
    try {
      const article = await this.articlesRepository.findOne({
        where: { id: articleId },
        relations: ['favoritedBy'],
      });

      article.favoritedBy = article.favoritedBy.filter(
        ({ id }) => id !== user.id,
      );
      article.favoritesCount = article.favoritedBy.length;
      await this.articlesRepository.save(article);
      return { message: TOAST_MSGS.ARTICLE_UNLIKED };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async findOne(id: string): Promise<{ data: { article: Article } }> {
    try {
      const article = await this.articlesRepository.findOne({ where: { id } });
      if (!article) {
        throw new NotFoundException(ERROR_MSGS.ARTICLE_NOT_FOUND);
      }
      return { data: { article } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  public async findByUser(
    userId: string,
  ): Promise<{ data: { articles: Article[] } }> {
    try {
      const articles = await this.articlesRepository.find({
        where: { author: { id: userId } },
        relations: ['author'],
      });
      return { data: { articles } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  public async updateArticle(
    id: string,
    updateArticleDto: UpdateArticleDto,
    user: User,
  ): Promise<{ data: { article: Article } }> {
    try {
      const article = await this.findArticleById(id);
      if (article.author.id !== user.id) {
        throw new ForbiddenException(ERROR_MSGS.UNAUTHORIZED_AUTHOR);
      }
      Object.assign(article, updateArticleDto);
      await this.articlesRepository.save(article);
      return { data: { article } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }

  public async deleteArticle(
    id: string,
    user: User,
  ): Promise<{ message: string }> {
    try {
      const article = await this.findArticleById(id);
      if (article.author.id !== user.id) {
        throw new ForbiddenException(ERROR_MSGS.UNAUTHORIZED_AUTHOR);
      }
      await this.articlesRepository.remove(article);
      return { message: 'Article deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }

  private async findArticleById(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(ERROR_MSGS.ARTICLE_NOT_FOUND);
    }
    return article;
  }
}
