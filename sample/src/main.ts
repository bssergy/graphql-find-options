import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import User from './users/user.entity';
import Comment from './users/comment.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (!(await User.count())) {
    const user = await User.create({ firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com', birthDate: new Date() });
    await Comment.create({ text: 'Test comment', userId: user.id });
    await Comment.create({ text: 'Some text', userId: user.id });
    await User.create({ firstName: 'Jack', lastName: 'Smith', email: 'jack.smith@mail.com' });
    await User.create({ email: 'test@mail.com' });
    await User.create({ firstName: 'Alice', email: 'alice@mail.com' });
    await User.create({ firstName: 'Bob', email: 'bob@mail.com' });
  }
}
bootstrap();
