import * as WebSocket from 'ws';
import { Logger } from '../common/helpers/logger';
import { MessageQueue } from '../message-queue/message-queue';
import { ListenerOptionsInterface } from './listener.interface';

export class Listener {
  private readonly port: number;
  private readonly messageQueue: MessageQueue;
  private readonly channel: string;
  private wss: WebSocket;
  private readonly logHeader;

  /**
   *
   * @param options
   * @param options.port start listener on the given port
   * @param options.redisUrl connect to the given redis serer
   * @param options.channel listen on the given redis channel
   */
  constructor(options: ListenerOptionsInterface) {
    this.port = options.port;
    this.messageQueue = new MessageQueue(options.redisUrl);
    this.channel = options.channel;
    this.logHeader = `Listener ${this.channel}`;
  }

  /**
   * Start the listener WebSocket
   */
  public async start(): Promise<void> {
    try {
      this.wss = await this.connect();

      Logger.info(`${this.logHeader} | Started on port: ${this.port}`);
    } catch (err) {
      Logger.error(`${this.logHeader} | connection failed: ${err}`);
      throw new Error('Connection failed');
    }

    await this.listenMessageQueue();

    this.wss.on('connection', (ws) => {
      Logger.debug(`${this.logHeader} | Client connected`);
    });
  }

  /**
   *  Close the listener WebSocket
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        resolve();
      });
    });
  }

  private connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocket.Server({ port: this.port, clientTracking: true });

      wss.on('listening', () => {
        resolve(wss);
      });

      wss.on('error', reject);
    });
  }

  private async listenMessageQueue() {
    const messageQueue = await this.messageQueue.subscribe(this.channel);

    messageQueue.on('message', (receivedChannel, message) => {
      Logger.debug(`${this.logHeader} | Channel: ${receivedChannel} Message: ${message}`);
      this.sendMessageToClients(message);
    });
  }

  private sendMessageToClients(message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
