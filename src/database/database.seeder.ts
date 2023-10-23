import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from '../countries/dto/create-country.dto';
import { CountriesRepository } from '../countries/countries.repository';
import { SettingsRepository } from '../settings/settings.repository';
import { CreateLanguageDto } from '../languages/dto/create-language.dto';
import { LanguageDirection } from '../languages/enums/language-directions';
import { LanguagesRepository } from '../languages/languages.repository';
import { ScreensRepository } from '../screens/screens.repository';
import { SettingsService } from '../settings/settings.service';
// import globalImages from '../settings/globalImages';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseSeeder {
  // IMPORTANT:  seeding of database can be done in many ways

  baseImageUrl = `${this.configService.get<string>(
    'NODE_APP_URL',
  )}:${this.configService.get<string>('NODE_APP_PORT')}/public/images/`;

  // TODO V1 ASK APP TEAM convert all images to webp ask APP TEAM if they don't have any issues, or APP display them properly, will do once design is final
  globalImages = {
    white_logo: `${this.baseImageUrl}white_logo.jpg`,
    golden_logo: `${this.baseImageUrl}golden_logo.jpg`,
    background_image: `${this.baseImageUrl}background_image.jpg`,
    guard_location: `${this.baseImageUrl}guard_location.jpg`,
    guard_heart: `${this.baseImageUrl}guard_heart.jpg`,
    guard_bird: `${this.baseImageUrl}guard_bird.jpg`,
    avatar: `${this.baseImageUrl}avatar.png`,
    avatar_male: `${this.baseImageUrl}avatar-male.png`,
    avatar_female: `${this.baseImageUrl}avatar-female.png`,
  };

  constructor(
    private readonly countriesRepository: CountriesRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly languagesRepository: LanguagesRepository,
    private readonly screensRepository: ScreensRepository,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
  ) {}

  async seedDatabase() {
    await this.seedCountries();
    await this.seedLanguages();
    // await this.seedScreens();
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
        flag: 'pk.png',
        isActive: true,
      },
      {
        name: 'United States of America',
        iso: 'US',
        code: '+1',
        numberLength: 10,
        timeZone: 'ET,CT,MT,PT',
        currency: 'USD',
        flag: 'us.png',
        isActive: true,
      },
      {
        name: 'United Kingdom',
        iso: 'GB',
        code: '+44',
        numberLength: 10,
        timeZone: 'GMT,UTC+0',
        currency: 'GBP',
        flag: 'gb.png',
        isActive: true,
      },
      {
        name: 'Saudi Arabia',
        iso: 'SA',
        code: '+966',
        numberLength: 10,
        timeZone: 'AST,UTC+3',
        currency: 'SAR',
        flag: 'sa.png',
        isActive: true,
      },
      {
        name: 'United Arab Emirates',
        iso: 'AE',
        code: '+971',
        numberLength: 9,
        timeZone: 'GST,UTC+4',
        currency: 'AED',
        flag: 'ae.png',
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
        name: 'EN US',
        code: 'en-US',
        direction: LanguageDirection.RTL,
      },
      {
        name: 'EN GB',
        code: 'en-GB',
        direction: LanguageDirection.RTL,
      },
      {
        name: 'UR',
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

  // async seedScreens() {
  //   const screens: CreateScreenDto[] = [
  //     {
  //       name: 'Send OTP',
  //       slug: 'otp_send',
  //     },
  //     {
  //       name: 'Verify OTP',
  //       slug: 'otp_verify',
  //     },
  //     {
  //       name: 'Dashboard',
  //       slug: 'dashboard',
  //     },
  //     {
  //       name: 'Home',
  //       slug: 'home',
  //     },
  //   ];
  //   for (const screen of screens) {
  //     const existingCountry = await this.screensRepository.findOne({
  //       slug: screen.slug,
  //     });
  //     if (existingCountry) {
  //       await this.screensRepository.findOneAndUpdate(
  //         { slug: screen.slug },
  //         { $set: screen },
  //       );
  //     } else {
  //       await this.screensRepository.create(screen);
  //     }
  //   }
  // }

  async seedSettings() {
    const staticSettings: any[] = [
      // {
      //   key: 'onboarding_screens',
      //   value: [
      //     {
      //       show: true,
      //       logo: this.globalImages.golden_logo,
      //       image: '',
      //       background_image: this.globalImages.background_image,
      //       heading: 'PILGRIM FAMILY',
      //       sub_heading_1: '',
      //       sub_heading_2: '',
      //       sub_heading_white: 'Pilgrim',
      //       sub_heading_golden: 'Family',
      //       bottom_text:
      //         "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      //       show_skip: false,
      //     },
      //     {
      //       show: true,
      //       logo: this.globalImages.white_logo,
      //       image: this.globalImages.guard_location,
      //       background_image: '',
      //       heading: '',
      //       sub_heading_1: 'Location-Aware',
      //       sub_heading_2: 'Contextual Alerts',
      //       sub_heading_white: '',
      //       sub_heading_golden: '',
      //       bottom_text:
      //         "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      //       show_skip: true,
      //     },
      //     {
      //       show: true,
      //       logo: this.globalImages.white_logo,
      //       image: this.globalImages.guard_heart,
      //       background_image: '',
      //       heading: '',
      //       sub_heading_1: 'Health Monitoring',
      //       sub_heading_2: 'and Support',
      //       sub_heading_white: '',
      //       sub_heading_golden: '',
      //       bottom_text:
      //         "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      //       show_skip: true,
      //     },
      //     {
      //       show: true,
      //       logo: this.globalImages.white_logo,
      //       image: this.globalImages.guard_bird,
      //       background_image: '',
      //       heading: '',
      //       sub_heading_1: 'Enhanced Safety and',
      //       sub_heading_2: 'Peace of mind',
      //       sub_heading_white: '',
      //       sub_heading_golden: '',
      //       bottom_text:
      //         "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
      //       show_skip: true,
      //     },
      //   ],
      //   dataType: 'json',
      //   module: 'screens',
      //   group: 'onboarding_screens',
      // },
      {
        key: 'global_images',
        value: this.globalImages,
        dataType: 'json',
        module: 'global',
        group: 'global',
      },
      {
        key: 'global_colors',
        value: {
          white: '#FFF',
          golden: '#d0b37b',
          black: '#000',
          green_dark: '#0f785f',
          green_light: '#478966',
        },
        dataType: 'json',
        module: 'global',
        group: 'global',
      },

      // {
      //   key: 'onboarding_common_logo_text_white',
      //   value: 'Pilgrim Family',
      //   dataType: 'string',
      //   module: 'onboarding',
      //   group: 'onboarding_common',
      // },
      // {
      //   key: 'onboarding_common_logo_text_half_white',
      //   value: 'Pilgrim',
      //   dataType: 'string',
      //   module: 'onboarding',
      //   group: 'onboarding_common',
      // },
      // {
      //   key: 'onboarding_common_logo_text_half_golden',
      //   value: 'Family',
      //   dataType: 'string',
      //   module: 'onboarding',
      //   group: 'onboarding_common',
      // },
      // {
      //   key: 'onboarding_common_logo_white',
      //   value: this.globalImages.white_logo,
      //   dataType: 'string',
      //   module: 'onboarding',
      //   group: 'onboarding_common',
      // },
      // {
      //   key: 'onboarding_common_logo_golden',
      //   value: this.globalImages.golden_logo,
      //   dataType: 'string',
      //   module: 'onboarding',
      //   group: 'onboarding_common',
      // },
      {
        key: 'group_creation_limit_of_user',
        value: 3,
        dataType: 'number',
        module: 'group',
        group: 'group',
      },
      {
        key: 'group_share_code_length',
        value: 6,
        dataType: 'json',
        module: 'group',
        group: 'group',
      },
      {
        key: 'group_add_landmark',
        value: {
          isOwner: true,
          isAdmin: true,
          isMember: true,
        },
        dataType: 'json',
        module: 'group',
        group: 'group_access',
      },
      {
        key: 'group_circle_create_update',
        value: {
          isOwner: true,
          isAdmin: false,
          isMember: false,
        },
        dataType: 'json',
        module: 'group',
        group: 'group_access',
      },
      {
        key: 'group_update_landmark',
        value: {
          isOwner: true,
          isAdmin: true,
          isMember: true,
        },
        dataType: 'json',
        module: 'group',
        group: 'group_access',
      },
      {
        key: 'group_delete_landmark',
        value: {
          isOwner: true,
          isAdmin: true,
          isMember: true,
        },
        dataType: 'json',
        module: 'group',
        group: 'group_access',
      },
      {
        key: 'group_name_update',
        value: {
          isOwner: true,
          isAdmin: false,
          isMember: false,
        },
        dataType: 'json',
        module: 'group',
        group: 'group_access',
      },
      {
        key: 'group_delete',
        value: {
          isOwner: true,
          isAdmin: false,
          isMember: false,
        },
        dataType: 'json',
        module: 'group',
        group: 'group_access',
      },
      {
        key: 'dev_contact_number',
        value: '+923132523242',
        dataType: 'string',
        module: 'contact',
        group: 'contact',
      },
      {
        key: 'dev_contact_email',
        value: 'se.zohaib+dev@gmail.com',
        dataType: 'string',
        module: 'contact',
        group: 'contact',
      },
      {
        key: 'admin_contact_number',
        value: '+923132523242',
        dataType: 'string',
        module: 'contact',
        group: 'contact',
      },
      {
        key: 'admin_contact_email',
        value: 'se.zohaib+admin@gmail.com',
        dataType: 'string',
        module: 'contact',
        group: 'contact',
      },
      {
        key: 'otp_expiry_seconds',
        value: 15,
        dataType: 'number',
        module: 'otp',
        group: 'otp',
      },
      {
        key: 'max_retry_limit',
        value: 3,
        dataType: 'number',
        module: 'otp',
        group: 'otp',
      },
      {
        key: 'reset_otp_retry_hours',
        value: 0.0166667, // 24, 0.0166667 = 1min
        dataType: 'number',
        module: 'otp',
        group: 'otp',
      },
      // { // TODO V1 ASK APP TEAM inform to app dev's
      //   key: 'map_init_center',
      //   value: { lat: 40.7128, lng: -74.006 }, // this will be user current lat long
      // },
      {
        key: 'map_init_zoom',
        value: 12,
        dataType: 'number',
        module: 'group',
        group: 'group_circle_map',
      },
      {
        key: 'map_circle_stroke_color',
        value: '#FF0000',
        dataType: 'string',
        module: 'group',
        group: 'group_circle_map',
      },
      {
        key: 'map_stroke_opacity',
        value: 0.8,
        dataType: 'number',
        module: 'group',
        group: 'group_circle_map',
      },
      {
        key: 'map_stroke_weight',
        value: 2,
        dataType: 'number',
        module: 'group',
        group: 'group_circle_map',
      },
      {
        key: 'map_fill_color',
        value: '#FF0000',
        dataType: 'string',
        module: 'group',
        group: 'group_circle_map',
      },
      {
        key: 'map_fill_opacity',
        value: 0.35,
        dataType: 'number',
        module: 'group',
        group: 'group_circle_map',
      },
    ];
    // console.log('staticSettings');
    // console.log(staticSettings);
    await this.saveOrUpdateSettings(staticSettings);
    // IMPORTANT:: first store static settings so it can be accessed from db while storing dynamic settings
    const languages = await this.languagesRepository.find({ isActive: true });
    const countries = await this.countriesRepository.find({ isActive: true });
    // const screens = await this.screensRepository.find({ isActive: true });
    const dynamicSettings: any[] = [
      // {
      //   key: 'screens',
      //   value: await Promise.all(
      //     screens.map(async (s) => {
      //       return {
      //         slug: s.slug,
      //         name: s.name,
      //         // translations: await this.settingsService.getScreenTranslations(),
      //         // translations: await this.settingsService.getScreenTranslations(
      //         //   s.slug,
      //         // ),
      //       };
      //     }),
      //   ),
      //   dataType: 'json',
      //   module: 'screens',
      //   group: 'screens',
      // },
      {
        key: 'countries',
        value: countries.map((c) => {
          return {
            // name: c.name,
            // iso: c.iso,
            code: c.code,
            numberLength: c.numberLength,
            // timeZone: c.timeZone,
            // currency: c.currency,
            flag: `${this.baseImageUrl}${c.flag}`,
          };
        }),
        dataType: 'json',
        module: 'countries',
        group: 'countries',
      },
      {
        key: 'languages',
        value: languages.map((l) => {
          return { code: l.code, direction: l.direction };
        }),
        dataType: 'json',
        module: 'languages',
        group: 'languages',
      },
      // { // it will not be dynamic by this approach because seeder does not have Accept-Language header so always fallback language will be stored
      //   key: 'translations',
      //   value: await this.settingsService.getScreenTranslations(),
      //   dataType: 'json',
      //   module: 'screens',
      //   group: 'screens',
      // },
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
