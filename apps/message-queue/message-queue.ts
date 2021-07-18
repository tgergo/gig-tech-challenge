import * as redis from 'redis';
import { Logger } from '../common/helpers/logger';

export class MessageQueue {
  private publisher: any;
  private subscriber: any;

  constructor(redisUrl: string) {
    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);
  }

  public async publish(channel: string, message: string): Promise<void> {
    Logger.debug(`MessageQueue | Message published to channel: ${channel}, message: ${message}`);
    await this.publisher.publish(channel, message);
  }

  public async subscribe(channel: string): Promise<any> {
    Logger.debug(`MessageQueue | Subscribed to channel: ${channel}`);
    await this.subscriber.subscribe(channel);
    return this.subscriber;
  }
}
