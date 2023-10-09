import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeeder } from './database.seeder';
import { CountriesModule } from '../countries/countries.module';
import { ConfigService } from '@nestjs/config';
import { SettingsModule } from '../settings/settings.module';
import { LanguagesModule } from '../languages/languages.module';
import { ScreensModule } from '../screens/screens.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get('MONGODB_URI'), //process.env.MONGODB_URI,
        };
      },
      inject: [ConfigService],
    }),
    CountriesModule,
    SettingsModule,
    LanguagesModule,
    ScreensModule,
    // I18nModule,
  ],
  providers: [DatabaseSeeder],
  exports: [],
})
export class DatabaseModule {}
