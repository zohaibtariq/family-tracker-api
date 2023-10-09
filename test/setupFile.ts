import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { connect, Connection } from 'mongoose';

beforeAll(async () => {
  // console.log('setupFile : beforeAll');
  const createTestModule = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();
    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  };
  const app = await createTestModule();
  const configService = app.get(ConfigService);
  process.env.MONGODB_TEST_URI = configService.get('MONGODB_TEST_URI');
  const mongoConnection: Connection = (
    await connect(process.env.MONGODB_TEST_URI)
  ).connection;
  global.mongoConnection = mongoConnection;
  global.testApp = app;
  // console.log(global.mongoConnection);
  // await app.close();
});

afterEach(async () => {
  // console.log('setupFile : afterEach');
  // const collections = global.mongoConnection.collections;
  // for (const key in collections) {
  //   const collection = collections[key];
  //   await collection.deleteMany({});
  // }
  await global.mongoConnection.dropDatabase();
});

afterAll(async () => {
  // console.log('setupFile : afterAll');
  if (global.mongoConnection) {
    // console.log('Dropping Database & Closing DB connection too');
    await global.mongoConnection.dropDatabase();
    await global.mongoConnection.close();
  }
  if (global.testApp) await global.testApp.close();
});
