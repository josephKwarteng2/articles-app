import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/model/comment.entity';
import { Article } from 'src/model/article.entity';
import { User } from 'src/model/user.entity';
import { ERROR_MSGS } from 'src/constants/constants';
import {
  CreateCommentsDto,
  UpdateCommentsDto,
} from './dto/create-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  private async findArticleById(articleId: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });
    if (!article) throw new NotFoundException(ERROR_MSGS.ARTICLE_NOT_FOUND);
    return article;
  }

  async createComment(
    articleId: string,
    dto: CreateCommentsDto,
    author: User,
  ): Promise<Comment> {
    const article = await this.findArticleById(articleId);

    const comment = this.commentsRepository.create({
      ...dto,
      author,
      article,
    });

    return this.commentsRepository.save(comment);
  }

  async findCommentsByArticle(articleId: string): Promise<Comment[]> {
    await this.findArticleById(articleId);

    return this.commentsRepository.find({
      where: { article: { id: articleId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateComment(
    commentId: string,
    dto: UpdateCommentsDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment || comment.author.id !== user.id) {
      throw new ForbiddenException(
        !comment
          ? ERROR_MSGS.COMMENT_NOT_FOUND
          : ERROR_MSGS.UNAUTHORIZED_AUTHOR,
      );
    }

    Object.assign(comment, dto);
    return this.commentsRepository.save(comment);
  }

  async deleteComment(commentId: string, user: User): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) throw new NotFoundException(ERROR_MSGS.COMMENT_NOT_FOUND);

    if (comment.author.id !== user.id) {
      throw new ForbiddenException(ERROR_MSGS.UNAUTHORIZED_AUTHOR);
    }

    await this.commentsRepository.remove(comment);
  }
}
