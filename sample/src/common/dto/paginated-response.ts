import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ClassType } from 'class-transformer/ClassTransformer';

export default function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    rows: TItem[];

    @Field(() => Int)
    count: number;
  }
  return PaginatedResponseClass;
}
