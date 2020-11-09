import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Table, Model, PrimaryKey, Column, AutoIncrement, HasMany, HasOne } from 'sequelize-typescript';
import Comment from './comment.entity';

@Table
@ObjectType()
export default class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  @Field(() => Int)
  id: number;

  @Column
  @Field({ nullable: true })
  firstName?: string;

  @Column
  @Field({ nullable: true })
  lastName?: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column
  @Field(() => Date, { nullable: true })
  birthDate?: Date;

  @HasMany(() => Comment)
  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @HasOne(() => Comment)
  @Field(() => Comment, { nullable: true })
  comment?: Comment;
}
