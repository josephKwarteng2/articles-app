import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard/jwt-auth.guard';
import { UpdateArticleDto } from './dto/update-articles.dto';
import { ArticleDto } from './dto/create-articles.dto';
import {
  ArticlesQueryDto,
  SearchArticlesQueryDto,
} from './dto/articles-query.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createArticleDto: ArticleDto, @Req() req) {
    return this.articlesService.createArticle(createArticleDto, req.user);
  }

  @Get()
  async findAll(@Query() query: ArticlesQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get('search')
  async search(@Query() searchQuery: SearchArticlesQueryDto) {
    return this.articlesService.searchArticlesByAuthorOrKeyword(
      searchQuery.query,
      searchQuery.limit,
      searchQuery.offset,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Param('id') id: string, @Req() req) {
    return this.articlesService.likeArticle(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unlike')
  async unlike(@Param('id') id: string, @Req() req) {
    return this.articlesService.unlikeArticle(id, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.articlesService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req,
  ) {
    return this.articlesService.updateArticle(id, updateArticleDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.articlesService.deleteArticle(id, req.user);
  }
}
