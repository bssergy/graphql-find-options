import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../common/dto/paginated-response';
import User from '../user.entity';

@ObjectType()
export class PaginatedUsersResponse extends PaginatedResponse(User) {}
