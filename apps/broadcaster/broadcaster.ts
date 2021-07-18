import * as WebSocket from 'ws';
import { Logger } from '../common/helpers/logger';
import { MessageQueue } from '../message-queue/message-queue';
import { BroadcasterOptionsInterface } from './broadcaster.interface';
import {
  BroadcastMessageInterface,
  ResponseMessageInterface,
} from '../common/interfaces/message.interface';

export class Broadcaster {
  private readonly port: number;
  private readonly messageQueue: MessageQueue;
  private wss: WebSocket;
  private readonly logHeader;

  /**
   *
   * @param options
   * @param options.port start listener on the given port
   * @param options.redisUrl connect to the given redis server
   */
  constructor(options: BroadcasterOptionsInterface) {
    this.port = options.port;
    this.messageQueue = new MessageQueue(options.redisUrl);
    this.logHeader = 'Broadcaster';
  }

  /**
   * Start the broadcaster WebSocket
   */
  public async start(): Promise<void> {
    try {
      this.wss = await this.connect();

      Logger.info(`${this.logHeader} | Started on port: ${this.port}`);
    } catch (err) {
      Logger.error(`${this.logHeader} | connection failed: ${err}`);
      throw new Error('Connection failed');
    }

    this.wss.on('connection', (ws) => {
      Logger.debug(`${this.logHeader} | Client connected`);

      this.messageHandler(ws);
    });
  }

  /**
   * Close the broadcaster WebSocket
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        resolve();
      });
    });
  }

  private messageHandler(ws): void {
    ws.on('message', async (message) => {
      Logger.debug(`${this.logHeader} | Received: ${message}`);

      let messageData: BroadcastMessageInterface;

      try {
        messageData = JSON.parse(message);
      } catch (err) {
        Logger.error(err);
        const resp: ResponseMessageInterface = { message: null, isSuccess: false };
        ws.send(JSON.stringify(resp));
      }

      if (messageData) {
        try {
          await this.broadcast(messageData.channel, message);
          const resp: ResponseMessageInterface = { message: messageData, isSuccess: true };

          ws.send(JSON.stringify(resp));
        } catch (err) {
          Logger.error(err);
          const resp: ResponseMessageInterface = { message: messageData, isSuccess: false };
          ws.send(JSON.stringify(resp));
        }
      }
    });
  }

  private connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocket.Server({ port: this.port });

      wss.on('listening', () => {
        resolve(wss);
      });

      wss.on('error', reject);
    });
  }

  private async broadcast(channel: string, message: string) {
    await this.messageQueue.publish(channel, message);
  }
}
