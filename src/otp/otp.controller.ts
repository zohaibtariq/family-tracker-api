import {
  Body,
  Controller,
  Get,
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
import otp_constants from './otp_constants';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { UserRole } from '../users/enums/user.enum';
import { Roles } from './decoraters/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis, // or // @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly redis: Redis
  ) {}

  @Post('send')
  async send(
    @Res() res: Response,
    @Body() sendOtpDto: SendOtpDto,
    @I18n() i18n: I18nContext,
  ) {
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
      },
      {
        new: true,
        upsert: true,
      },
    );
    const userId = user._id;
    const otpCounts = await this.otpService.countOtp(userId);
    const settings: any = await this.settingsService.findAll();
    if (otpCounts < settings.max_retry_limit) {
      const createdResponse = await this.otpService.create(userId);
      this.responseService.success(
        res,
        replacePlaceholders(i18n.t('otp_send.OTP_SENT_MSG'), {
          PHONE_NUMBER: phoneNumber,
        }),
        {
          phoneNumber: createdResponse.phoneNumber,
          otp: createdResponse.otp,
        },
      );
    } else
      throw new HttpException(
        replacePlaceholders(i18n.t('otp_send.OTP_MAX_RETRY_EXCEPTION'), {
          MAX_RETRY_LIMIT: settings.max_retry_limit,
          RESET_OTP_RETRY_HOURS: settings.reset_otp_retry_hours,
        }),
        HttpStatus.BAD_REQUEST,
      );
  }

  @Post('verify')
  async verify(
    @Res() res: Response,
    @Body() verifyOtpDto: VerifyOtpDto,
    @I18n() i18n: I18nContext,
  ) {
    const { status, user } =
      await this.otpService.getVerifiedOTPUserId(verifyOtpDto);
    if (status !== otp_constants.OTP_VERIFIED)
      return this.responseService.badRequest(
        res,
        replacePlaceholders(i18n.t('otp_verify.' + status), {
          OTP_EXPIRY_SECONDS:
            await this.settingsService.get('otp_expiry_seconds'),
        }),
      );
    const userId = user._id;
    const tokens = await this.otpService.getTokens(userId, user);
    await this.otpService.updateRefreshToken(userId, tokens.refreshToken);
    let responseData: any = tokens;
    if (process.env.NODE_ENV !== 'production')
      responseData = { ...tokens, userId };
    return this.responseService.success(
      res,
      i18n.t('otp_verify.OTP_VERIFICATION_SUCCESS'),
      responseData,
    );
  }

  @Post('logout')
  @Roles('user', 'admin', 'superadmin')
  @UseGuards(AccessTokenGuard, RolesGuard)
  async logout(@Req() req: any, @Res() res: Response) {
    // console.log('POST logout');
    // console.log(req.user);

    const token = (
      req.headers as { authorization?: string }
    )?.authorization?.replace('Bearer ', '');
    // console.log('LOGOUT TOKEN');
    // console.log(token);
    if (token) {
      await this.redis.set(
        token,
        'revoked',
        'EX',
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN_SEC'),
      ); // Blacklist token for TIME expiry of access token as defined in .env
    }

    await this.otpService.logout(req.user['sub']);
    return this.responseService.response(res, {}, '', HttpStatus.NO_CONTENT);
  }

  @Get('refresh')
  @Roles('user', 'admin', 'superadmin')
  @UseGuards(RefreshTokenGuard, RolesGuard)
  async refreshTokens(@Req() req: any, @Res() res: Response) {
    return this.responseService.response(
      res,
      await this.otpService.refreshTokens(
        req.user['sub'],
        req.user['refreshToken'],
      ),
    );
  }
}
