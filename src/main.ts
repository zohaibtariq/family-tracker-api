// FIXME
// NOTE
// HACK
// REVIEW
// IMPROVE
// TODO
// IMPORTANT

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseSeeder } from './database/database.seeder';
import { GenericExceptionFilter } from './exceptions/generic-exception.filter';
import { ResponseService } from './response/response.service';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
// import { I18nMiddleware } from './i18n.middleware';
import { I18nMiddleware } from 'nestjs-i18n';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import * as express from 'express';
// import * as bodyParser from 'body-parser';
// import * as multer from 'multer';

async function bootstrap() {
  // const expressApp = express();
  // Use body parsing middleware
  // expressApp.use(bodyParser.json());

  // Configure multer for file uploads
  // expressApp.use(multer({ dest: './public' }).single('file'));
  const app = await NestFactory.create(
    AppModule,
    // new ExpressAdapter(expressApp),
    {
      snapshot: true,
      abortOnError: false,
    },
  );
  app.use(I18nMiddleware);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GenericExceptionFilter(new ResponseService()));
  await app.get(DatabaseSeeder).seedDatabase();
  app.use(passport.initialize());
  await app.listen(3000);
}

bootstrap();
