import { Controller, Get, Res } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ResponseService } from '../response/response.service';
import { Response } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';
import { FamilyRoles } from '../groups/enums/family-roles';

// @UseGuards(AccessTokenGuard)
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly responseService: ResponseService,
  ) {}

  // @Post()
  // @Roles('admin', 'superadmin')
  // @UseGuards(ValidUserGuard)
  // create() {}

  @Get()
  // @Roles('user', 'admin', 'superadmin') // NOTE allowed globally irrespective of what role they have
  // @UseGuards(ValidUserGuard)
  async allSettings(@Res() res: Response, @I18n() i18n: I18nContext) {
    const allStoredSettings = await this.settingsService.findAll();
    const translations = await this.settingsService.getScreenTranslations();
    const group_family_roles = {};
    group_family_roles[FamilyRoles.MOTHER] = i18n.t(
      'global.GROUP_FAMILY_ROLE_MOTHER',
    );
    group_family_roles[FamilyRoles.FATHER] = i18n.t(
      'global.GROUP_FAMILY_ROLE_FATHER',
    );
    group_family_roles[FamilyRoles.GRAND_FATHER] = i18n.t(
      'global.GROUP_FAMILY_ROLE_GRAND_FATHER',
    );
    group_family_roles[FamilyRoles.GRAND_MOTHER] = i18n.t(
      'global.GROUP_FAMILY_ROLE_GRAND_MOTHER',
    );
    group_family_roles[FamilyRoles.SIBLING] = i18n.t(
      'global.GROUP_FAMILY_ROLE_SIBLING',
    );
    group_family_roles[FamilyRoles.FRIEND] = i18n.t(
      'global.GROUP_FAMILY_ROLE_FRIEND',
    );
    return this.responseService.response(res, {
      ...allStoredSettings,
      translations,
      group_family_roles,
    });
  }
}
