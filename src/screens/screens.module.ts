import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScreensService } from './screens.service';
import { ScreensController } from './screens.controller';
import { ScreensRepository } from './screens.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Screen, ScreenSchema } from './schemas/screen.schema';
import { ResponseModule } from '../response/response.module';
import { SettingsModule } from '../settings/settings.module';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Screen.name,
        schema: ScreenSchema,
      },
    ]),
    ResponseModule,
    SettingsModule,
  ],
  controllers: [ScreensController],
  providers: [ScreensService, ScreensRepository],
  exports: [ScreensService, ScreensRepository],
})
export class ScreensModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RevokedAccessTokenBlacklistMiddleware).forRoutes('screens');
  }
}
