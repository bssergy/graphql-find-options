import { InputType, Field } from '@nestjs/graphql';
import { NumberFilter } from '../../common/filters/number.filter';
import { DateFilter } from 'src/common/filters/date.filter';
import { fn } from 'sequelize';
import { FnArg } from 'graphql-find-options/lib/decorators/fn-arg';
import { getColumn } from 'graphql-find-options/lib/helpers/column-helper';
import User from '../user.entity';
import { StringFilter } from 'src/common/filters/string.filter';

@InputType()
export class GetUsersArgs {
  @Field(() => NumberFilter, { nullable: true })
  id?: NumberFilter;

  @Field(() => DateFilter, { nullable: true })
  birthDate?: DateFilter;

  @Field(() => StringFilter, { nullable: true })
  @FnArg((alias: string) =>
    fn(
      'CONCAT',
      getColumn(User, user => user.firstName, alias),
      ' ',
      getColumn(User, user => user.lastName, alias),
      getColumn(User, user => user.comment.id)
    ),
  )
  name: StringFilter;

  @Field({ nullable: true })
  email?: string;
}
