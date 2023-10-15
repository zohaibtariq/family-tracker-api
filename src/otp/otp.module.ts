import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OtpRepository } from './otp.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { ResponseModule } from '../response/response.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { RolesGuard } from './guards/roles.guard';
import { RevokedAccessTokenBlacklistMiddleware } from './middlewares/revoked-access-token-blacklist.middleware';
import { ScreensModule } from '../screens/screens.module';
// import { RedisService } from 'nestjs-redis';

// import { RedisCacheModule } from '../redis/redis.module';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: Otp.name,
        schema: OtpSchema,
      },
    ]),
    UsersModule,
    SettingsModule,
    ResponseModule,
    ScreensModule,
    // RedisModule,
    // RedisModule,
    // RedisCacheModule,
  ],
  controllers: [OtpController],
  providers: [
    OtpService,
    OtpRepository,
    JwtService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    RolesGuard,
    // RedisService,
  ],
})
export class OtpModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RevokedAccessTokenBlacklistMiddleware)
      .forRoutes('otp/logout');
  }
}
