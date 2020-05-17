import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class StringFilter {
  @Field({ nullable: true })
  eq?: string;

  @Field({ nullable: true })
  not?: string;

  @Field({ nullable: true })
  like?: string;

  @Field(() => [StringFilter], { nullable: true })
  and?: StringFilter[];

  @Field(() => [StringFilter], { nullable: true })
  or?: StringFilter[];
}
