import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from './schemas/country.schema';
import { APP_FILTER } from '@nestjs/core';
import { DuplicateKeyExceptionFilter } from '../exceptions/duplicate-key.filter';
import { CountriesRepository } from './countries.repository';
import { ResponseModule } from '../response/response.module';
import { RevokedAccessTokenBlacklistMiddleware } from '../otp/middlewares/revoked-access-token-blacklist.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Country.name,
        schema: CountrySchema,
      },
    ]),
    ResponseModule,
  ],
  controllers: [CountriesController],
  providers: [
    CountriesService,
    CountriesRepository,
    {
      provide: APP_FILTER,
      useClass: DuplicateKeyExceptionFilter,
    },
  ],
  exports: [CountriesService, CountriesRepository],
})
export class CountriesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RevokedAccessTokenBlacklistMiddleware)
      .forRoutes('countries');
  }
}
