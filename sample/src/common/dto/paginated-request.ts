import { Field, Int, ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';

export default function PaginatedRequest<TWhere, TOrder>(TFilterClass: ClassType<TWhere>, TOrderClass: ClassType<TOrder>) {
  @ArgsType()
  abstract class PaginatedRequestClass {
    @Field(() => Int, { defaultValue: 0, nullable: true })
    offset?: number;

    @Field(() => Int, { defaultValue: 200, nullable: true })
    limit?: number;

    @Field(() => TFilterClass, { nullable: true })
    @Type(() => TFilterClass)
    where?: TWhere;

    @Field(() => [TOrderClass], { nullable: true })
    @Type(() => TOrderClass)
    order?: TOrder[];
  }
  return PaginatedRequestClass;
}
