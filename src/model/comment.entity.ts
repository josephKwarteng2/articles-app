import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @ManyToOne(() => Article, (article) => article.comments)
  article: Article;
}
