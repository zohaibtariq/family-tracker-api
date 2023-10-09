// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';
// import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { Controller } from '@nestjs/common';

@Controller()
export class AppController {
  // constructor(
  //   private readonly appService: AppService,
  //   private readonly i18n: I18nService,
  // ) {}
  // @Get()
  // // async getHello() {
  // async getHello(@I18n() i18n: I18nContext) {
  //   // return await i18n.translate('otp.OTP_SENT_MSG');
  //   // return await i18n.t('otp.OTP_SENT_MSG');
  //   return i18n.t('otp.OTP_SENT_MSG', { lang: I18nContext.current().lang });
  //   return this.i18n.t('otp.OTP_SENT_MSG', { lang: I18nContext.current().lang });
  //   // return this.appService.getHello();
  // }
}
