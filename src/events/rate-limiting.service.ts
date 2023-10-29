import { Injectable } from '@nestjs/common';

interface RateLimitData {
  lastMessageTime: number;
  messageCount: number;
}

@Injectable()
export class RateLimitingService {
  private rateLimitMap: Map<string, RateLimitData> = new Map();

  // NOTE almost realtime
  private messageLimit = 1; // Maximum 1 message per 5 seconds
  private timeLimit = 5000; // 5 seconds in milliseconds

  // NOTE little delay
  // private messageLimit = 1; // Maximum 1 message per 10 seconds
  // private timeLimit = 10000; // 10 seconds in milliseconds

  // NOTE slow update
  // private messageLimit = 1; // Maximum 1 message per 15 seconds
  // private timeLimit = 15000; // 15 seconds in milliseconds

  // NOTE more slow update
  // private messageLimit = 1; // Maximum 1 message per 30 seconds
  // private timeLimit = 30000; // 30 seconds in milliseconds

  // NOTE most slow update
  // private messageLimit = 1; // Maximum 1 message per 60 seconds
  // private timeLimit = 60000; // 60 seconds in milliseconds

  checkRateLimit(clientId: string): boolean {
    console.log('RateLimitingService');
    const now = Date.now();
    const rateLimitData = this.rateLimitMap.get(clientId);

    if (rateLimitData) {
      const { lastMessageTime, messageCount } = rateLimitData;

      if (
        now - lastMessageTime < this.timeLimit &&
        messageCount >= this.messageLimit
      ) {
        // The client has exceeded the rate limit
        return false;
      }

      // Update the rate limit data
      rateLimitData.lastMessageTime = now;
      rateLimitData.messageCount++;
    } else {
      // Initialize rate limit data for the new client
      this.rateLimitMap.set(clientId, {
        lastMessageTime: now,
        messageCount: 1,
      });
    }

    return true;
  }
}
