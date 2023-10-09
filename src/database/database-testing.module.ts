import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseSeeder } from './database.seeder';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get('MONGODB_TEST_URI'), //process.env.MONGODB_URI,
        };
        // const instance = await MongoMemoryServer.create();
        // const uri = instance.getUri();
        // process.env.MONGODB_TEST_URI = uri.slice(0, uri.lastIndexOf('/'));
        // return {
        //   uri: process.env.MONGODB_TEST_URI,
        // };
      },
      inject: [ConfigService],
    }),
    CountriesModule,
  ],
  providers: [DatabaseSeeder],
})
export class DatabaseTestingModule {}
