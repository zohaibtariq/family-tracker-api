import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';
import { SettingsService } from '../settings/settings.service';
import { SettingsRepository } from '../settings/settings.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';
import { ResponseService } from '../response/response.service';
import { GroupsRepository } from './groups.repository';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupUsersService } from './group.users.service';
import { GroupUsersRepository } from './group.users.repository';
import { GroupUsers, GroupUsersSchema } from './schemas/group.users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Settings.name,
        schema: SettingsSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
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
  ],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    GroupsRepository,
    UsersService,
    UsersRepository,
    SettingsService,
    SettingsRepository,
    ResponseService,
    GroupUsersService,
    GroupUsersRepository,
  ],
})
export class GroupsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RevokedAccessTokenBlacklistMiddleware).forRoutes('groups');
  }
}
