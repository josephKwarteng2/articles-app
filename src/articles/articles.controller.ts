import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard/jwt-auth.guard';
import { CreateArticleDto } from './dto/create-articles.dto';
import { UpdateArticleDto } from './dto/update-articles.dto';

@Controller('/api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    return this.articlesService.createArticle(createArticleDto, req.user);
  }

  @Get()
  async findAll(
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('favorited') favorited?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.articlesService.findAll({
      tag,
      author,
      favorited,
      limit,
      offset,
    });
  }
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req,
  ) {
    return this.articlesService.updateArticle(id, updateArticleDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req) {
    await this.articlesService.deleteArticle(id, req.user);
    return { message: 'Article deleted successfully' };
  }
}
