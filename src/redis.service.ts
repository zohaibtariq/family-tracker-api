import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(
    key: string,
    value: string,
    expiresIn: number,
  ): Promise<'OK' | null> {
    return this.redisClient.set(key, value, 'EX', expiresIn);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async remember<T>(
    key: string,
    expiresIn: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    const cachedData = await this.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
    const freshData = await callback();
    await this.set(key, JSON.stringify(freshData), expiresIn);
    return freshData;
  }
}
