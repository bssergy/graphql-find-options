import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GraphQLModule, registerEnumType } from '@nestjs/graphql';
import { Order } from './common/dto/order';
import { DatabaseModule } from './database/database.module';
import { DateScalar } from './common/scalars/date.scalar';

registerEnumType(Order, {
  name: 'Order',
});

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    UsersModule,
    DatabaseModule,
  ],
  providers: [DateScalar],
})
export class AppModule {}
