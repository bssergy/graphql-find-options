import { ArgsType } from '@nestjs/graphql';
import PaginatedRequest from '../../common/dto/paginated-request';
import { GetUsersArgs } from './get-users.args';
import { GetUsersOrderArgs } from './get-users-order.args';

@ArgsType()
export class PaginatedUsersRequest extends PaginatedRequest(GetUsersArgs, GetUsersOrderArgs) {}
