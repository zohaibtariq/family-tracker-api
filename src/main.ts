import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseSeeder } from './database/database.seeder';
import { GenericExceptionFilter } from './exceptions/generic-exception.filter';
import { ResponseService } from './response/response.service';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GenericExceptionFilter(new ResponseService()));
  await app.get(DatabaseSeeder).seedDatabase();
  app.use(passport.initialize());
  await app.listen(3000);
}

bootstrap();
