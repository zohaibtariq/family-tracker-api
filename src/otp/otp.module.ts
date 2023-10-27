import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { OtpRepository } from './otp.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { ValidUserGuard } from './guards/valid.user.guard';
import { RevokedAccessTokenBlacklistMiddleware } from './middlewares/revoked-access-token-blacklist.middleware';
import { ScreensModule } from '../screens/screens.module';
import { ResponseService } from '../response/response.service';
import { RedisService } from '../redis.service';
import { GroupsService } from '../groups/groups.service';
import { GroupsRepository } from '../groups/groups.repository';
import { GroupUsersService } from '../groups/group.users.service';
import { GroupUsersRepository } from '../groups/group.users.repository';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import {
  GroupUsers,
  GroupUsersSchema,
} from '../groups/schemas/group.users.schema';
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
      {
        name: Group.name,
        schema: GroupSchema,
      },
      {
        name: GroupUsers.name,
        schema: GroupUsersSchema,
      },
    ]),
    UsersModule,
    SettingsModule,
    // ResponseModule,
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
    ValidUserGuard,
    // RedisService,
    ResponseService,
    RedisService,
    GroupsService,
    GroupsRepository,
    GroupUsersService,
    GroupUsersRepository,
  ],
})
export class OtpModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RevokedAccessTokenBlacklistMiddleware)
      .forRoutes('otp/logout');
  }
}
