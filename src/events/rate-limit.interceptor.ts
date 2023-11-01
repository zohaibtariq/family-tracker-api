import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RateLimitingService } from './rate-limiting.service';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private readonly rateLimitingService: RateLimitingService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    // ): Promise<Observable<any>> {
    // console.log('RateLimitInterceptor');
    const client = context.switchToWs().getClient();
    const clientId = client.id;

    if (!this.rateLimitingService.checkRateLimit(clientId)) {
      // console.log('Rate limit exceeded');
      // The client has exceeded the rate limit, handle accordingly
      client.emit('rateLimitExceeded', 'Rate limit exceeded');
      return [];
    }

    return next.handle();
  }
}
