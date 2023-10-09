import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { validate } from './environment.validation';
import { CountriesModule } from './countries/countries.module';
import { DatabaseModule } from './database/database.module';
// import { AuthModule } from './auth/auth.module';
import { DatabaseTestingModule } from './database/database-testing.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { OtpModule } from './otp/otp.module';
import { SettingsModule } from './settings/settings.module';
import { ResponseModule } from './response/response.module';
import { ScreensModule } from './screens/screens.module';
import { LanguagesModule } from './languages/languages.module';
// import { RedisCacheModule } from './redis/redis.module';
// import { RedisModule } from 'nestjs-redis';
// import { RedisModule } from './redis/redis.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true, // IMPORTANT:  should be available globally in our case
      envFilePath: '.env', //IMPORTANT: since we have .env
    }),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
        password: '',
      },
    }),
    // RedisModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     host: configService.get<string>('REDIS_HOST'),
    //     port: configService.get<number>('REDIS_PORT'),
    //     password: configService.get<string>('REDIS_PASSWORD'),
    //     db: configService.get<number>('REDIS_DB'),
    //   }),
    //   inject: [ConfigService],
    // }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['Accept-Language']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
    }),
    process.env.NODE_ENV === 'test' ? DatabaseTestingModule : DatabaseModule,
    DatabaseModule,
    // AuthModule,
    UsersModule,
    CountriesModule,
    DatabaseModule,
    OtpModule,
    SettingsModule,
    ResponseModule,
    ScreensModule,
    LanguagesModule,
    // RedisModule,
    // RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(TokenBlacklistMiddleware).forRoutes('*'); // Apply to all routes
//   }
// }
