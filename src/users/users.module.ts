import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { APP_FILTER } from '@nestjs/core';
import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';
import { ResponseModule } from '../response/response.module';
import { SettingsService } from '../settings/settings.service';
import { SettingsRepository } from '../settings/settings.repository';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';
import { RedisService } from '../redis.service';
import { GroupsService } from '../groups/groups.service';
import { GroupsRepository } from '../groups/repositories/groups.repository';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { GroupUsersService } from '../groups/group.users.service';
import { GroupUsersRepository } from '../groups/repositories/group.users.repository';
import {
  GroupUsers,
  GroupUsersSchema,
} from '../groups/schemas/group.users.schema';
import { UrlsRepository } from '../groups/repositories/urls.repository';
import { Url, UrlSchema } from '../groups/schemas/url.schema';

// import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: Group.name, schema: GroupSchema },
      { name: GroupUsers.name, schema: GroupUsersSchema },
      { name: Url.name, schema: UrlSchema },
    ]),
    ResponseModule,
    // SettingsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    {
      provide: APP_FILTER,
      useClass: DuplicateKeyExceptionFilter,
    },
    SettingsService,
    SettingsRepository,
    RedisService,
    GroupsService,
    GroupsRepository,
    GroupUsersService,
    GroupUsersRepository,
    UrlsRepository,
  ],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RevokedAccessTokenBlacklistMiddleware).forRoutes('users');
  }
}
