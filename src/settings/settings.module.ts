import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsRepository } from './settings.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { ResponseModule } from '../response/response.module';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';

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
    ]),
    ResponseModule,
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    SettingsRepository,
    UsersService,
    UsersRepository,
  ],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RevokedAccessTokenBlacklistMiddleware).forRoutes('settings');
  }
}
