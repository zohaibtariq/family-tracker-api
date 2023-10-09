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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ResponseModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    {
      provide: APP_FILTER,
      useClass: DuplicateKeyExceptionFilter,
    },
  ],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RevokedAccessTokenBlacklistMiddleware).forRoutes('users');
  }
}
