import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { validate } from './environment.validation';
import { CountriesModule } from './countries/countries.module';
import { DatabaseModule } from './database/database.module';
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
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    // MulterModule.register({
    //   dest: 'public',
    // }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('AVATAR_UPLOAD_DEST'),
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
    }),
    ConfigModule.forRoot({
      validate,
      isGlobal: true, // IMPORTANT:  should be available globally in our case
      envFilePath: '.env', //IMPORTANT: since we have .env
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),
            db: configService.get<number>('REDIS_DB'),
          },
        };
      },
    }),
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
    UsersModule,
    CountriesModule,
    DatabaseModule,
    OtpModule,
    SettingsModule,
    ResponseModule,
    ScreensModule,
    LanguagesModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
