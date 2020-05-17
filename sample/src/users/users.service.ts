import { Injectable } from '@nestjs/common';
import User from './user.entity';
import Comment from './comment.entity';
import { PaginatedUsersResponse } from './dto/paginated-users-response';
import { CreateUserInput } from './dto/create-user.input';
import { PaginatedUsersRequest } from './dto/paginated-users-request';
import { GraphQLResolveInfo } from 'graphql';
import { findAndCountAll, findAllWithNested } from 'graphql-find-options';
import { GetCommentsArgs } from './dto/get-comments.args';

@Injectable()
export class UsersService {
  async getAll(args: PaginatedUsersRequest, info: GraphQLResolveInfo): Promise<PaginatedUsersResponse> {
    return findAndCountAll(User, args, info);
  }

  create(args: CreateUserInput): Promise<User> {
    return User.create(args);
  }

  async getWithComments(ids: number[], args: GetCommentsArgs, info: GraphQLResolveInfo): Promise<Comment[][]> {
    return findAllWithNested(ids, User, Comment, args, info);
  }
}
