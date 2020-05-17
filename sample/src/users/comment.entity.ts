import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Table, Model, PrimaryKey, Column, AutoIncrement, ForeignKey } from 'sequelize-typescript';
import User from './user.entity';

@Table
@ObjectType()
export default class Comment extends Model<Comment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field()
  text: string;

  @ForeignKey(() => User)
  userId: number;
}
