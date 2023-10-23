import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
// import { RedisService } from 'nestjs-redis';
import { Response } from 'express';
import { ResponseService } from '../../response/response.service';
import { I18nService } from 'nestjs-i18n';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class RevokedAccessTokenBlacklistMiddleware implements NestMiddleware {
  constructor(
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
    @InjectRedis() private readonly redis: Redis, // or // @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly redis: Redis
  ) {}

  async use(
    req: Request,
    res: Response,
    next: () => void,
    // @I18n() i18n: I18nContext,
  ) {
    const token = (
      req.headers as { authorization?: string }
    )?.authorization?.replace('Bearer ', '');

    // console.log('MIDDLEWARE TOKEN');
    // console.log(token);

    if (!token) {
      next(); // No token, continue to the route
      return;
    }

    const isBlacklisted = await this.redis.get(token);

    if (isBlacklisted) {
      // const message = this.i18n.t('language.TOKEN_REVOKED');
      const message = this.i18n.t('language.TOKEN_REVOKED');
      this.responseService.response(
        res,
        { message },
        message,
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      next(); // Token is valid, continue to the route
    }
  }
}
