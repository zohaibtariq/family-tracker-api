import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { LanguagesRepository } from './languages.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Language, LanguageSchema } from './schemas/language.schema';
import { ResponseModule } from '../response/response.module';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Language.name,
        schema: LanguageSchema,
      },
    ]),
    ResponseModule,
  ],
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguagesRepository],
  exports: [LanguagesService, LanguagesRepository],
})
export class LanguagesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RevokedAccessTokenBlacklistMiddleware)
      .forRoutes('languages');
  }
}
