import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis.service';
import { ResponseService } from '../response/response.service';
import { RateLimitingService } from './rate-limiting.service';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { UrlsRepository } from '../groups/repositories/urls.repository';
import { SettingsService } from '../settings/settings.service';
import { GroupsRepository } from '../groups/repositories/groups.repository';
import { GroupUsersService } from '../groups/group.users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from '../groups/schemas/url.schema';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SettingsRepository } from '../settings/settings.repository';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { GroupUsersRepository } from '../groups/repositories/group.users.repository';
import {
  GroupUsers,
  GroupUsersSchema,
} from '../groups/schemas/group.users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Settings.name,
        schema: SettingsSchema,
      },
      {
        name: GroupUsers.name,
        schema: GroupUsersSchema,
      },
      {
        name: Group.name,
        schema: GroupSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Url.name,
        schema: UrlSchema,
      },
    ]),
  ],
  providers: [
    EventsGateway,
    EventsService,
    JwtService,
    ConfigService,
    RedisService,
    ResponseService,
    RateLimitingService,
    GroupsService,
    UsersService,
    UsersRepository,
    UrlsRepository,
    SettingsService,
    SettingsRepository,
    GroupsRepository,
    GroupUsersService,
    GroupUsersRepository,
  ],
})
export class EventsModule {} // Note do not apply RevokedAccessTokenBlacklistMiddleware here it will not restrict connection access
