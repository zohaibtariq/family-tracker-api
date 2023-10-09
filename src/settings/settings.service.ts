import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { I18nService } from 'nestjs-i18n';
import { replacePlaceholders } from '../utils/helpers';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll() {
    return await this.settingsRepository.find().then((settings) => {
      const allSettings = {};
      settings.forEach((setting) => {
        allSettings[setting.key] = setting.value;
        return allSettings;
      });
      return allSettings;
    });
  }

  async get(key: string = '') {
    const settings = await this.findAll();
    return settings[key];
  }

  async getScreenTranslations(screenSlug: string) {
    // console.log('getScreenTranslations START ' + screenSlug);
    // return this.i18n.t(screenSlug); //2
    let translations = await this.i18n.t(screenSlug);
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
    // return this.i18n.t(screenSlug, { lang: I18nContext.current().lang }); //
  }
}
