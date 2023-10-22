// FIXME: Use FIXME for highlighting critical issues that need urgent fixing.
// NOTE: Use NOTE to provide additional information or context.
// HACK: Indicate code that is a workaround or quick-and-dirty solution.
// REVIEW: Suggest that the code needs a review.
// IMPROVE: Suggest improvements or optimizations.
// TODO: Suggest improvements or optimizations.
// IMPORTANT: Suggest improvements or optimizations.

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
