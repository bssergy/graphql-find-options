import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadModels: true,
      define: {
        timestamps: false,
        underscored: true,
      },
    }),
  ],
})
export class DatabaseModule {}
