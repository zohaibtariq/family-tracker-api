import { ForbiddenException, Injectable } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import {
  addSecondsToUnixTimestamp,
  generateNumericString,
  subtractMinutesToUnixTimestamp,
  subtractSecondsToUnixTimestamp,
} from '../utils/helpers';
import { SettingsService } from '../settings/settings.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import mongoose, { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import otp_constants from './constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserDocument } from '../users/schemas/user.schema';
// import { InjectRedis } from '@liaoliaots/nestjs-redis';
// import Redis from 'ioredis';
// import { I18nService } from 'nestjs-i18n';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // private readonly i18n: I18nService, // @InjectRedis() private readonly redis: Redis, // NOTE or // @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly redis: Redis
  ) {}

  async create(userId: mongoose.Types.ObjectId) {
    const createOtpData = {
      userId,
      expiry: addSecondsToUnixTimestamp(
        new Date().getTime(),
        await this.settingsService.get('otp_expiry_seconds'),
      ),
      verified: false,
      otp: generateNumericString(6, [1, 2, 3, 4, 5, 6, 7, 8, 9]),
    };
    return await this.otpRepository.create(createOtpData);
  }

  async countOtp(userId: mongoose.Types.ObjectId) {
    // console.log('reset_otp_retry_hours');
    // console.log(await this.settingsService.get('reset_otp_retry_hours'));
    const retryAfterUnixTime = subtractMinutesToUnixTimestamp(
      new Date().getTime(),
      (await this.settingsService.get('reset_otp_retry_hours')) * 60,
    );
    // console.log('retryAfterUnixTime');
    // console.log(retryAfterUnixTime);
    const countFilter = {
      userId,
      verified: false,
      expiry: { $gt: retryAfterUnixTime },
    };
    // console.log('countFilter');
    // console.log(countFilter);
    return await this.otpRepository.countDocuments(countFilter);
  }

  async getVerifiedOTPUserId(verifyOtpDto: VerifyOtpDto) {
    const phoneNumber = verifyOtpDto.countryCode + verifyOtpDto.phoneNumber;
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    const userId = user._id || '';
    if (user === null)
      return { status: otp_constants.PHONE_NUMBER_NOT_FOUND, user };
    if (user === undefined)
      return { status: otp_constants.OTP_EXPIRY_SEC_NOT_DEFINED, user };
    const expirySeconds = await this.settingsService.get('otp_expiry_seconds');
    const unixOtpTimeStamp = subtractSecondsToUnixTimestamp(
      new Date().getTime(),
      expirySeconds,
    );
    const { otp } = verifyOtpDto;
    const filterVerifyOtp = await this.otpRepository.findOneAndUpdate(
      {
        otp,
        userId,
        verified: false,
        expiry: { $gte: unixOtpTimeStamp },
      },
      { verified: true },
      { new: true },
    );
    if (filterVerifyOtp === null)
      return { status: otp_constants.OTP_ERROR_WRONG_OR_EXPIRED, user };
    await this.otpRepository.deleteMany({
      // NOTE here we kept all verified otps only and will delete all non verified otp of that specific user.
      verified: false,
      // userId, // NOTE if we want to delete all non verified user ids comment this
      expiry: { $lt: unixOtpTimeStamp },
    });
    return { status: otp_constants.OTP_VERIFIED, user };
  }

  async getTokens(user: UserDocument) {
    const User = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      role: user.role,
      status: user.status,
      avatar: user?.avatar,
      emergencyNumber: user?.emergencyNumber,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...User, sub: User.id },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { ...User, sub: User.id },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: Types.ObjectId, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(
      userId,
      {
        refreshToken: hashedRefreshToken,
      },
      { new: true },
    );
  }

  async hashData(data: string) {
    return await argon2.hash(data);
  }

  async logout(userId: Types.ObjectId) {
    return await this.usersService.update(
      userId,
      { refreshToken: null },
      { new: true },
    );
  }

  async refreshTokens(userId: Types.ObjectId, refreshToken: string) {
    const user = await this.usersService.findById(userId, {});
    if (!user || !user.refreshToken)
      throw new ForbiddenException(
        'Access Denied User or Refresh Token not found', // NOTE we cannot translate it screen vice as per our current logic bcz it is not bind with any screen directly its global
      );
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied - Refresh Token Not Matched'); // NOTE we cannot translate it screen vice as per our current logic bcz it is not bind with any screen directly its global
    }
    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
