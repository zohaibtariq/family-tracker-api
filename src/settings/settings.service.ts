import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { replacePlaceholders } from '../utils/helpers';
import { RedisService } from '../redis.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
  ) {}

  async findAll(filter = {}) {
    // console.log('inside CACHE_SETTINGS_ALL filter');
    return this.redisService.remember(`CACHE_SETTINGS_ALL`, 3600, async () => {
      // console.log('inside CACHE_SETTINGS_ALL');
      // Simulate fetching user data from a database or another source
      return this.transformSettings(await this.settingsRepository.find(filter));
    });
    // return this.transformSettings(cachedSettings);
  }

  async findByGroup(module: string, group: string) {
    return this.transformSettings(
      await this.settingsRepository.find({ module, group }),
    );
  }

  transformSettings(settings: any) {
    // return settings.then((settings) => {
    const allSettings = {};
    settings.forEach((setting) => {
      allSettings[setting.key] = setting.value;
      return allSettings;
    });
    return allSettings;
    // });
  }

  async get(key: string = '', filters: any = {}) {
    // console.log('setting service get cache');
    let CacheKey = 'CACHE_SETTINGS_';
    if (key != '') CacheKey += key + '_';
    if (filters?.group) CacheKey += 'GROUP_' + filters?.group;
    if (filters?.module) CacheKey += 'MODULE_' + filters?.module;
    // console.log('CacheKey: ' + CacheKey);
    return await this.redisService.remember(CacheKey, 3600, async () => {
      // console.log('setting service get cache inside');
      const settings = await this.findAll(filters);
      return settings[key];
    });
  }

  // async getScreenTranslations(screenSlug: string) {
  async getScreenTranslations() {
    // console.log('getScreenTranslations START ' + screenSlug);
    // return this.i18n.t(screenSlug);
    // let translations = await this.i18n.t(screenSlug);
    // console.log('setting service getScreenTranslations');
    return await this.redisService.remember(
      `CACHE_SETTINGS_SCREENS_TRANSLATIONS_ALL_LANG_${
        I18nContext.current().lang
      }`,
      3600,
      async () => {
        // console.log('setting service getScreenTranslations inside cache');
        let translations = await this.i18n.t('language', {
          lang: I18nContext.current().lang,
        });
        if (typeof translations === 'string') translations = {};
        // console.log(translations);
        const settings = await this.findAll();
        // console.log(translations);
        // console.log(settings);
        Object.keys(settings).forEach((key) => {
          settings[key.toUpperCase()] = settings[key];
          delete settings[key];
        });
        Object.keys(translations).forEach((key) => {
          translations[key] = replacePlaceholders(translations[key], settings);
        });
        // console.log(translations);
        // console.log('getScreenTranslations END ' + screenSlug);
        return translations;
        // return this.i18n.t(screenSlug, { lang: I18nContext.current().lang });
      },
    );
  }

  async getScreensTranslations() {
    const settings = await this.redisService.remember(
      `CACHE_SETTINGS_ALL_SETTINGS`,
      3600,
      async () => {
        return await this.findAll();
      },
    );
    const languages = await this.redisService.remember(
      `CACHE_SETTINGS_LANGUAGES`,
      3600,
      async () => {
        return await this.get('languages', {
          module: 'languages',
          group: 'languages',
        });
      },
    );
    // const response = [];
    const response = {};
    for (const language of languages) {
      let translations = await this.i18n.t('language', {
        lang: language.code,
      });
      if (typeof translations === 'string') translations = {};
      Object.keys(settings).forEach((key) => {
        settings[key.toUpperCase()] = settings[key];
        delete settings[key];
      });
      Object.keys(translations).forEach((key) => {
        translations[key] = replacePlaceholders(translations[key], settings);
      });
      // response.push({ [language.code]: translations });
      response[language.code] = translations;
    }
    return response;
  }
}
