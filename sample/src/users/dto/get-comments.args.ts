import { Field, ArgsType } from '@nestjs/graphql';
import { StringFilter } from '../../common/filters/string.filter';

@ArgsType()
export class GetCommentsArgs {
  @Field(() => StringFilter, { nullable: true })
  text?: StringFilter;
}
