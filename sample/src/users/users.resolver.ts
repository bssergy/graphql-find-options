import { Resolver, Query, Args, Mutation, Info, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import User from './user.entity';
import Comment from './comment.entity';
import { PaginatedUsersRequest } from './dto/paginated-users-request';
import { PaginatedUsersResponse } from './dto/paginated-users-response';
import { CreateUserInput } from './dto/create-user.input';
import { GraphQLResolveInfo } from 'graphql';
import DataLoader from 'dataloader';
import { GetCommentsArgs } from './dto/get-comments.args';
import { plainToClass } from 'class-transformer';

@Resolver(() => User)
export class UsersResolver {
  private commentsLoader: DataLoader<any, Comment[], any> = new DataLoader(keys =>
    this.usersService.getWithComments(
      keys.map(x => (x as any).id),
      keys && keys[0] && (keys[0] as any).args,
      keys && keys[0] && (keys[0] as any).info,
    ),
  );

  constructor(private usersService: UsersService) {}

  @Query(() => PaginatedUsersResponse)
  getUsers(@Args() args: PaginatedUsersRequest, @Info() info: GraphQLResolveInfo): Promise<PaginatedUsersResponse> {
    return this.usersService.getAll(plainToClass(PaginatedUsersRequest, args), info);
  }

  @Mutation(() => User)
  addUser(@Args('createUserInput', { type: () => CreateUserInput }) args: CreateUserInput): Promise<User> {
    return this.usersService.create(args);
  }

  @ResolveField(() => [Comment])
  comments(@Parent() user: User, @Args() args: GetCommentsArgs, @Info() info: GraphQLResolveInfo): Promise<Comment[]> {
    return this.commentsLoader.load({
      id: user.id,
      args,
      info,
    });
  }
}
