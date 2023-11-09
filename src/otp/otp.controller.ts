import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { OtpService } from './otp.service';
import { UsersService } from '../users/users.service';
import { SettingsService } from '../settings/settings.service';
import { ResponseService } from '../response/response.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { replacePlaceholders } from '../utils/helpers';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/send-otp-dto';
import otp_constants from './constants';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { UserRole } from '../users/enums/user.enum';
import { ValidUserGuard } from './guards/valid.user.guard';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../users/enums/users.status.enum';
import { ScreensService } from '../screens/screens.service';
// import { ScreenSlug } from '../screens/enums/screens.slugs.enum';
import { RequestUserInterface } from '../users/interfaces/request-user-interface';
import { RedisService } from '../redis.service';
import { GroupsService } from '../groups/groups.service';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
    private readonly screensService: ScreensService,
    private readonly groupsService: GroupsService,
    private readonly redisService: RedisService, // @InjectRedis() private readonly redis: Redis, // or // @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly redis: Redis
  ) {}

  @Post('send')
  @UseGuards(ValidUserGuard) // NOTE Do not move it to top
  async send(
    @Req() req: RequestUserInterface,
    @Res() res: Response,
    @Body() sendOtpDto: SendOtpDto,
    @I18n() i18n: I18nContext,
  ) {
    // console.log(
    //   req.i18nService.t('language.HELLO', {
    //     lang: req.i18nContext.current().lang,
    //   }),
    // );
    // console.log(req.i18nService.t('language.HELLO', { lang: req.i18nLang }));
    // console.log(req.i18nContext.current().lang);
    // console.log(req.i18nLang);
    // console.log(req.i18nContext);
    const phoneNumber = sendOtpDto.countryCode + sendOtpDto.phoneNumber;
    const user = await this.usersService.createOrUpdate(
      {
        phoneNumber,
      },
      {
        phoneNumber,
        role: UserRole.USER,
        // role: UserRole.ADMIN,
        // role: UserRole.SUPER_ADMIN,
        refreshToken: null,
        countryCode: sendOtpDto.countryCode,
      },
      {
        new: true,
        upsert: true,
      },
    );
    const userId = user._id;
    // console.log('userId');
    // console.log(userId);
    const otpCounts = await this.otpService.countOtp(userId);
    // console.log('otpCounts');
    // console.log(otpCounts);
    const settings: any = await this.settingsService.findAll();
    if (otpCounts < settings.max_retry_limit) {
      const createdResponse = await this.otpService.create(userId);
      this.responseService.response(
        res,
        {
          phoneNumber: createdResponse.phoneNumber,
          otp: createdResponse.otp,
        },
        // replacePlaceholders(i18n.t('language.OTP_SENT_MSG'), {
        replacePlaceholders(i18n.t('language.OTP_SENT_MSG'), {
          PHONE_NUMBER: phoneNumber,
        }),
      );
    } else
      throw new HttpException(
        // replacePlaceholders(i18n.t('language.OTP_MAX_RETRY_EXCEPTION'), {
        replacePlaceholders(i18n.t('language.OTP_MAX_RETRY_EXCEPTION'), {
          MAX_RETRY_LIMIT: settings.max_retry_limit,
          RESET_OTP_RETRY_HOURS: settings.reset_otp_retry_hours,
        }),
        HttpStatus.BAD_REQUEST,
      );
  }

  @Post('verify')
  @UseGuards(ValidUserGuard) // NOTE Do not move it to top
  async verify(
    @Res() res: Response,
    @Body() verifyOtpDto: VerifyOtpDto,
    @I18n() i18n: I18nContext,
  ) {
    const { status, user } =
      await this.otpService.getVerifiedOTPUserId(verifyOtpDto);
    if (status !== otp_constants.OTP_VERIFIED)
      return this.responseService.response(
        res,
        {},
        // replacePlaceholders(i18n.t('language.' + status), {
        replacePlaceholders(i18n.t('language.' + status), {
          OTP_EXPIRY_SECONDS:
            await this.settingsService.get('otp_expiry_seconds'),
        }),
        HttpStatus.BAD_REQUEST,
      );
    const userId = user._id;
    const tokens = await this.otpService.getTokens(user);
    await this.usersService.update(userId, { status: UserStatus.VERIFIED }); // NOTE: set user status here with OTP verified, make sure at first line i check for blocked state of user it must not reach here if user status is blocked
    await this.otpService.updateRefreshToken(userId, tokens.refreshToken);
    let responseData: any = tokens;
    if (process.env.NODE_ENV !== 'production')
      responseData = {
        ...tokens,
        userId,
        userGroupsCount: await this.groupsService.countUserGroups(userId),
        user: {
          id: userId,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          emailAddress: user.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          emergencyNumber: user.emergencyNumber,
          currentLocation: user.currentLocation,
        },
      };
    // responseData.next_screen = ScreenSlug.HOME;
    // responseData.previous_screen = ScreenSlug.OTP_SEND;
    // responseData.current_screen = ScreenSlug.OTP_VERIFY;
    return this.responseService.response(
      res,
      responseData,
      // i18n.t('language.OTP_VERIFICATION_SUCCESS'),
      i18n.t('language.OTP_VERIFICATION_SUCCESS'),
    );
  }

  @Post('logout')
  // @Roles('user', 'admin', 'superadmin') // NOTE allowed globally irrespective of what role they have
  @UseGuards(AccessTokenGuard, ValidUserGuard) // NOTE do not move ValidUserGuard at top by thinking it is defined over every route by sequence this requires req.user to work properly and it is injected by AccessTokenGuard here
  async logout(@Req() req: RequestUserInterface, @Res() res: Response) {
    const token = (
      req.headers as { authorization?: string }
    )?.authorization?.replace('Bearer ', '');
    if (token) {
      await this.redisService.set(
        token,
        'revoked',
        parseInt(
          this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN_SEC'),
        ),
      ); // Blacklist token for TIME expiry of access token as defined in .env
    }
    await this.otpService.logout(req.user.id);
    return this.responseService.response(res, {}, '', HttpStatus.NO_CONTENT);
  }

  @Post('refresh')
  // @Roles('user', 'admin', 'superadmin') // NOTE allowed globally irrespective of what role they have
  @UseGuards(RefreshTokenGuard, ValidUserGuard) // NOTE do not move ValidUserGuard at top by thinking it is defined over every route by sequence this requires req.user to work properly and it is injected by RefreshTokenGuard here
  async refreshTokens(@Req() req: RequestUserInterface, @Res() res: Response) {
    return this.responseService.response(
      res,
      await this.otpService.refreshTokens(req.user.id, req.user.refreshToken),
    );
  }
}
