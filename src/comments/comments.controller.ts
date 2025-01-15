import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CommentsDto } from './dto/create-comments.dto';

@Controller('articles/:articleId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('articleId') articleId: string,
    @Body() createCommentDto: CommentsDto,
    @Req() req,
  ) {
    return this.commentsService.createComment(
      articleId,
      createCommentDto,
      req.user,
    );
  }

  @Get()
  async findAll(@Param('articleId') articleId: string) {
    return this.commentsService.findCommentsByArticle(articleId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':commentId')
  async update(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: CommentsDto,
    @Req() req,
  ) {
    return this.commentsService.updateComment(
      commentId,
      updateCommentDto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async remove(@Param('commentId') commentId: string, @Req() req) {
    await this.commentsService.deleteComment(commentId, req.user);
    return { message: 'Comment deleted successfully' };
  }
}
