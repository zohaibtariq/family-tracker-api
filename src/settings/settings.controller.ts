import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AccessTokenGuard } from '../otp/guards/accessToken.guard';
import { Roles } from '../otp/decoraters/roles.decorator';
import { RolesGuard } from '../otp/guards/roles.guard';
import { ResponseService } from '../response/response.service';
import { Response } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles('admin', 'superadmin')
  @UseGuards(RolesGuard)
  create() {}

  @Get()
  @Roles('user', 'admin', 'superadmin')
  @UseGuards(RolesGuard)
  async allSettings(@Res() res: Response) {
    return this.responseService.response(
      res,
      await this.settingsService.findAll(),
    );
  }
}
