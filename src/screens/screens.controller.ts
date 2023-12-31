import { Controller } from '@nestjs/common';
// import { ScreensService } from './screens.service';
// import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
// import { CreateScreenDto } from './dto/create-screen.dto';
// import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
// import { Roles } from '../otp/decorators/roles.decorator';
// import { ValidUserGuard } from '../otp/guards/valid.user.guard';
// import { I18n, I18nContext } from 'nestjs-i18n';
// import { Types } from 'mongoose';
// import { ResponseService } from '../response/response.service';
// import { Response } from 'express';
// import { SettingsService } from '../settings/settings.service';
// import { replacePlaceholders } from '../utils/helpers';

// @UseGuards(AccessTokenGuard, ValidUserGuard)
@Controller('screens')
export class ScreensController {
  // constructor() {} // private readonly settingsService: SettingsService, // private readonly responseService: ResponseService, // private readonly screensService: ScreensService,
  // NOTE working but explicitly commented to not modify our seeder data from API get it from settings we don't need this ATM
  // @Post()
  // @Roles('admin', 'superadmin')
  // // @UseGuards(ValidUserGuard)
  // @UseFilters(DuplicateKeyExceptionFilter)
  // async create(@Res() res: Response, @Body() createScreenDto: CreateScreenDto) {
  //   return this.responseService.response(
  //     res,
  //     await this.screensService.create(createScreenDto),
  //     '',
  //     HttpStatus.CREATED,
  //   );
  // }
  // NOTE working but explicitly commented to not modify our seeder data from API get it from settings we don't need this ATM
  // @Get()
  // // @Roles('user', 'admin', 'superadmin') // NOTE allowed globally irrespective of what role they have
  // // @UseGuards(ValidUserGuard)
  // async findAll(@Res() res: Response) {
  //   return this.responseService.response(
  //     res,
  //     await this.screensService.findAll(),
  //   );
  // }
  // NOTE working but explicitly commented to not modify our seeder data from API get it from settings we don't need this ATM
  // @Get(':id')
  // async findOne(@Res() res: Response, @Param('id') id: Types.ObjectId) {
  //   return this.responseService.response(
  //     res,
  //     await this.screensService.findOne(id),
  //   );
  // }
  // NOTE working but explicitly commented to not modify our seeder data from API get it from settings we don't need this ATM
  // @Get(':slug/translations')
  // async screenTranslations(
  //   @Res() res: Response,
  //   @Param('slug') slug: string,
  //   @I18n() i18n: I18nContext,
  // ) {
  //   // const translations = i18n.t(slug);
  //   const translations = i18n.t('language');
  //   const settings = await this.settingsService.findAll();
  //   Object.keys(settings).forEach((key) => {
  //     settings[key.toUpperCase()] = settings[key];
  //     delete settings[key];
  //   });
  //   Object.keys(translations).forEach((key) => {
  //     translations[key] = replacePlaceholders(translations[key], settings);
  //   });
  //   return this.responseService.response(res, translations);
  // }
  // @UseGuards(AccessTokenGuard)
  // @Patch(':id')
  // update(
  //   @Param('id') id: Types.ObjectId,
  //   @Body() updateScreenDto: UpdateScreenDto,
  // ) {
  //   return this.screensService.update(id, updateScreenDto, { new: true });
  // }
  // @UseGuards(AccessTokenGuard)
  // @Delete(':id')
  // remove(@Param('id') id: Types.ObjectId) {
  //   return this.screensService.remove(id);
  // }
}
