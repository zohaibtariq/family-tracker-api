import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeeder } from './database.seeder';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { SettingsRepository } from '../settings/settings.repository';
import { LanguagesRepository } from '../languages/languages.repository';
import { ScreensRepository } from '../screens/screens.repository';
import { CountriesRepository } from '../countries/countries.repository';
import { Country, CountrySchema } from '../countries/schemas/country.schema';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';
import { Language, LanguageSchema } from '../languages/schemas/language.schema';
import { Screen, ScreenSchema } from '../screens/schemas/screen.schema';
import { RedisService } from '../redis.service';

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
        name: Language.name,
        schema: LanguageSchema,
      },
      {
        name: Screen.name,
        schema: ScreenSchema,
      },
    ]),
  ],
  providers: [
    DatabaseSeeder,
    SettingsService,
    CountriesRepository,
    SettingsRepository,
    LanguagesRepository,
    ScreensRepository,
    RedisService,
  ],
  exports: [],
})
export class DatabaseModule {}
