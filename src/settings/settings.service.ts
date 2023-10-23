import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { replacePlaceholders } from '../utils/helpers';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(filter = {}) {
    // TODO V1 - should be cached with redis and must write cache clear logic as well on any change made
    return this.transformSettings(await this.settingsRepository.find(filter));
  }

  async findByGroup(module: string, group: string) {
    // TODO V1 - should be cached with redis and must write cache clear logic as well on any change made
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

  async get(key: string = '', filters = {}) {
    // TODO V1 - should be cached with redis and must write cache clear logic as well on any change made
    const settings = await this.findAll(filters);
    return settings[key];
  }

  // async getScreenTranslations(screenSlug: string) {
  async getScreenTranslations() {
    // TODO V1 - should be cached with redis and must write cache clear logic as well on any change made
    // console.log('getScreenTranslations START ' + screenSlug);
    // return this.i18n.t(screenSlug);
    // let translations = await this.i18n.t(screenSlug);
    let translations = await this.i18n.t('global', {
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
  }
}
