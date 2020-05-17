import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class NumberFilter {
  @Field(() => Int, { nullable: true })
  eq?: number;

  @Field(() => Int, { nullable: true })
  lt?: number;

  @Field(() => Int, { nullable: true })
  gt?: number;

  @Field(() => [Int], { nullable: true })
  in?: number[];

  @Field(() => Int, { nullable: true })
  not?: number;

  @Field(() => [NumberFilter], { nullable: true })
  and?: NumberFilter[];

  @Field(() => [NumberFilter], { nullable: true })
  or?: NumberFilter[];
}
