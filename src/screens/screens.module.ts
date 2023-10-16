import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScreensService } from './screens.service';
import { ScreensController } from './screens.controller';
import { ScreensRepository } from './screens.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Screen, ScreenSchema } from './schemas/screen.schema';
import { ResponseModule } from '../response/response.module';
import { SettingsModule } from '../settings/settings.module';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Screen.name,
        schema: ScreenSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    ResponseModule,
    SettingsModule,
  ],
  controllers: [ScreensController],
  providers: [ScreensService, ScreensRepository, UsersService, UsersRepository],
  exports: [ScreensService, ScreensRepository],
})
export class ScreensModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RevokedAccessTokenBlacklistMiddleware).forRoutes('screens');
  }
}
