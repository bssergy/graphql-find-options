import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class DateFilter {
  @Field({ nullable: true })
  eq?: Date;

  @Field({ nullable: true })
  lt?: Date;

  @Field({ nullable: true })
  gt?: Date;

  @Field(() => [Date], { nullable: true })
  between?: Date[];

  @Field({ nullable: true })
  not?: Date;

  @Field(() => [DateFilter], { nullable: true })
  and?: DateFilter[];

  @Field(() => [DateFilter], { nullable: true })
  or?: DateFilter[];
}
