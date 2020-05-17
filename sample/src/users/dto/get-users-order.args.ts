import { Field, InputType } from '@nestjs/graphql';
import { Order } from '../../common/dto/order';

@InputType()
export class GetUsersOrderArgs {
  @Field(() => Order, { nullable: true })
  id?: Order;
}
