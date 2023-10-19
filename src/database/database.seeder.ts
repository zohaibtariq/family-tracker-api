import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../countries/dto/create-country.dto';
import { CountriesRepository } from '../countries/countries.repository';
import { SettingsRepository } from '../settings/settings.repository';
import { CreateLanguageDto } from '../languages/dto/create-language.dto';
import { LanguageDirection } from '../languages/enums/language-directions';
import { LanguagesRepository } from '../languages/languages.repository';
import { CreateScreenDto } from '../screens/dto/create-screen.dto';
import { ScreensRepository } from '../screens/screens.repository';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class DatabaseSeeder {
  // IMPORTANT:  seeding of database can be done in many ways

  constructor(
    private readonly countriesRepository: CountriesRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly languagesRepository: LanguagesRepository,
    private readonly screensRepository: ScreensRepository,
    private readonly settingsService: SettingsService,
  ) {}

  async seedDatabase() {
    await this.seedCountries();
    await this.seedLanguages();
    await this.seedScreens();
    await this.seedSettings();
  }

  async seedCountries() {
    const countries: CreateCountryDto[] = [
      {
        name: 'Pakistan',
        iso: 'PK',
        code: '+92',
        numberLength: 10,
        timeZone: 'UTC+5',
        currency: 'PKR',
        flag: 'https://flagcdn.com/w320/pk.png',
        isActive: true,
      },
      {
        name: 'United States of America',
        iso: 'US',
        code: '+1',
        numberLength: 10,
        timeZone: 'ET,CT,MT,PT',
        currency: 'USD',
        flag: 'https://flagcdn.com/w320/us.png',
        isActive: false,
      },
      {
        name: 'United Kingdom',
        iso: 'GB',
        code: '+44',
        numberLength: 10,
        timeZone: 'GMT,UTC+0',
        currency: 'GBP',
        flag: 'https://flagcdn.com/w320/gb.png',
        isActive: false,
      },
      {
        name: 'Saudi Arabia',
        iso: 'SA',
        code: '+966',
        numberLength: 10,
        timeZone: 'AST,UTC+3',
        currency: 'SAR',
        flag: 'https://flagcdn.com/w320/sa.png',
        isActive: true,
      },
      {
        name: 'United Arab Emirates',
        iso: 'AE',
        code: '+971',
        numberLength: 9,
        timeZone: 'GST,UTC+4',
        currency: 'AED',
        flag: 'https://flagcdn.com/w320/ae.png',
        isActive: true,
      },
    ];
    for (const country of countries) {
      const existingCountry = await this.countriesRepository.findOne({
        iso: country.iso,
      });
      if (existingCountry) {
        await this.countriesRepository.findOneAndUpdate(
          { iso: country.iso },
          { $set: country },
        );
      } else {
        await this.countriesRepository.create(country);
      }
    }
  }

  async seedLanguages() {
    const languages: CreateLanguageDto[] = [
      {
        name: 'English',
        code: 'en',
        direction: LanguageDirection.RTL,
      },
      {
        name: 'French',
        code: 'fr',
        direction: LanguageDirection.RTL,
      },
      {
        name: 'Urdu',
        code: 'ur',
        direction: LanguageDirection.LTR,
      },
    ];
    for (const language of languages) {
      const existingLanguage = await this.languagesRepository.findOne({
        code: language.code,
      });
      if (existingLanguage) {
        await this.languagesRepository.findOneAndUpdate(
          { code: language.code },
          { $set: language },
        );
      } else {
        await this.languagesRepository.create(language);
      }
    }
  }

  async seedScreens() {
    const screens: CreateScreenDto[] = [
      {
        name: 'Send OTP',
        slug: 'otp_send',
      },
      {
        name: 'Verify OTP',
        slug: 'otp_verify',
      },
      {
        name: 'Dashboard',
        slug: 'dashboard',
      },
      {
        name: 'Home',
        slug: 'home',
      },
    ];
    for (const screen of screens) {
      const existingCountry = await this.screensRepository.findOne({
        slug: screen.slug,
      });
      if (existingCountry) {
        await this.screensRepository.findOneAndUpdate(
          { slug: screen.slug },
          { $set: screen },
        );
      } else {
        await this.screensRepository.create(screen);
      }
    }
  }

  async seedSettings() {
    const languages = await this.languagesRepository.find({ isActive: true });
    const screens = await this.screensRepository.find({ isActive: true });
    const staticSettings: any[] = [
      {
        key: 'dev_contact_number',
        value: '+923132523242',
      },
      {
        key: 'dev_contact_email',
        value: 'se.zohaib+dev@gmail.com',
      },
      {
        key: 'admin_contact_number',
        value: '+923132523242',
      },
      {
        key: 'admin_contact_email',
        value: 'se.zohaib+admin@gmail.com',
      },
      {
        key: 'default_avatar',
        value: 'public/images/defaults/avatar.png',
      },
      {
        key: 'default_avatar_male',
        value: 'public/images/defaults/avatar-male.png',
      },
      {
        key: 'default_avatar_female',
        value: 'public/images/defaults/avatar-female.png',
      },
      {
        key: 'otp_expiry_seconds',
        value: 15,
      },
      {
        key: 'max_retry_limit',
        value: 3,
      },
      {
        key: 'reset_otp_retry_hours',
        value: 0.0166667, // 24, 0.0166667 = 1min
      },
      // { // TODO inform to app dev's
      //   key: 'map_init_center',
      //   value: { lat: 40.7128, lng: -74.006 }, // this will be user current lat long
      // },
      {
        key: 'map_init_zoom',
        value: 12,
      },
      {
        key: 'map_circle_stroke_color',
        value: '#FF0000',
      },
      {
        key: 'map_stroke_opacity',
        value: 0.8,
      },
      {
        key: 'map_stroke_weight',
        value: 2,
      },
      {
        key: 'map_fill_color',
        value: '#FF0000',
      },
      {
        key: 'map_fill_opacity',
        value: 0.35,
      },
    ];
    // console.log('staticSettings');
    // console.log(staticSettings);
    await this.saveOrUpdateSettings(staticSettings); // IMPORTANT:: first store static settings so it can be accessed from db while storing dynamic settings
    const dynamicSettings: any[] = [
      {
        key: 'screens',
        value: await Promise.all(
          screens.map(async (s) => {
            return {
              slug: s.slug,
              name: s.name,
              translations: await this.settingsService.getScreenTranslations(
                s.slug,
              ),
            };
          }),
        ),
      },
      {
        key: 'languages',
        value: languages.map((l) => {
          return { code: l.code, direction: l.direction };
        }),
      },
    ];
    await this.saveOrUpdateSettings(dynamicSettings);
  }

  async saveOrUpdateSettings(settings) {
    for (const setting of settings) {
      const existing = await this.settingsRepository.findOne({
        key: setting.key,
      });
      if (existing) {
        await this.settingsRepository.findOneAndUpdate(
          { key: setting.key },
          { $set: setting },
        );
      } else {
        await this.settingsRepository.create(setting);
      }
    }
  }
}
