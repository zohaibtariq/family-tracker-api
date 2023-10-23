import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schemas/country.schema';
import { APP_FILTER } from '@nestjs/core';
import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
import { CountriesRepository } from './countries.repository';
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
        name: Country.name,
        schema: CountrySchema,
      },
      {
        name: Settings.name,
        schema: SettingsSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
        // schema: forwardRef(() => UserSchema),
      },
    ]),
  ],
  controllers: [CountriesController],
  providers: [
    CountriesService,
    CountriesRepository,
    {
      provide: APP_FILTER,
      useClass: DuplicateKeyExceptionFilter,
    },
    SettingsService,
    SettingsRepository,
    UsersService,
    UsersRepository,
    ResponseService,
    RedisService,
    // {
    //   provide: UsersRepository,
    //   useFactory: () => {
    //     return new UsersRepository(forwardRef(() => UserModel));
    //   },
    // },
  ],
  exports: [CountriesService, CountriesRepository],
})
export class CountriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RevokedAccessTokenBlacklistMiddleware)
      .forRoutes('countries');
  }
}
