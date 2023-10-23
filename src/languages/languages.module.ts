import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { LanguagesRepository } from './languages.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Language, LanguageSchema } from './schemas/language.schema';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';
import { SettingsService } from '../settings/settings.service';
import { SettingsRepository } from '../settings/settings.repository';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ResponseService } from '../response/response.service';
import { RedisService } from '../redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Language.name,
        schema: LanguageSchema,
      },
      {
        name: Settings.name,
        schema: SettingsSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [LanguagesController],
  providers: [
    LanguagesService,
    LanguagesRepository,
    SettingsService,
    SettingsRepository,
    UsersService,
    UsersRepository,
    ResponseService,
    RedisService,
  ],
  exports: [LanguagesService, LanguagesRepository],
})
export class LanguagesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RevokedAccessTokenBlacklistMiddleware)
      .forRoutes('languages');
  }
}
