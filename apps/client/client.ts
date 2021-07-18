import * as WebSocket from 'ws';
import { Logger } from '../common/helpers/logger';
import { ClientOptionsInterface } from './client.interface';
import {
  BroadcastMessageInterface,
  ResponseMessageInterface,
} from '../common/interfaces/message.interface';
import { EventEmitter } from 'events';

export class Client {
  private readonly clientId: string;
  private readonly broadcasterUrl: string;
  private readonly listenerUrl: string;
  private listenerWs: WebSocket;
  private readonly listenerEvents: EventEmitter;
  private broadCasterWs: WebSocket;
  private readonly broadCasterEvents: EventEmitter;
  private readonly logHeader;

  /**
   *
   * @param options
   * @param options.clientId identify the client
   * @param options.broadcasterUrl connect to the given broadcaster websocket (optional)
   * @param options.listenerUrl connect to the given listener websocket (optional)
   */
  constructor(options: ClientOptionsInterface) {
    if (!options.broadcasterUrl && !options.listenerUrl) {
      throw new Error('You should set broadcasterUrl or listenerUrl');
    }

    this.clientId = options.clientId;
    this.broadcasterUrl = options.broadcasterUrl;
    this.listenerUrl = options.listenerUrl;
    this.logHeader = `Client ${this.clientId}`;
    this.listenerEvents = new EventEmitter();
    this.broadCasterEvents = new EventEmitter();
  }

  /**
   * connect to the websockets
   */
  public async start(): Promise<void> {
    if (this.broadcasterUrl) {
      try {
        this.broadCasterWs = await this.connect(this.broadcasterUrl);
        Logger.info(`${this.logHeader} | Connected to broadCaster ${this.broadcasterUrl}`);

        this.broadCasterWs.on('message', (message) => {
          Logger.debug(`${this.logHeader} | Received from broadCaster: ${message}`);

          const respMessageObj: ResponseMessageInterface = JSON.parse(message);
          this.broadCasterEvents.emit('message', respMessageObj);
        });
      } catch (err) {
        Logger.error(`${this.logHeader} | broadcast error: ${err}`);
        throw new Error('Connection failed');
      }
    }
    if (this.listenerUrl) {
      try {
        this.listenerWs = await this.connect(this.listenerUrl);

        Logger.info(`${this.logHeader} | Connected to listener ${this.listenerUrl}`);

        this.listenerWs.on('message', (message) => {
          Logger.debug(`${this.logHeader} | Received from listener: ${message}`);

          const messageObj: BroadcastMessageInterface = JSON.parse(message);
          this.listenerEvents.emit('message', messageObj);
        });
      } catch (err) {
        Logger.error(`${this.logHeader} | listener error: ${err}`);
        throw new Error('Connection failed');
      }
    }
  }

  /**
   * send message to the broadcast websocket
   */
  public async broadcast(messageData: BroadcastMessageInterface): Promise<void> {
    if (!this.broadCasterWs) {
      throw new Error('Cant broadcast. Maybe you forgot to set broadcasterUrl in the options');
    }

    await this.broadCasterWs.send(JSON.stringify(messageData));
  }

  /**
   * can use to add listeners to the "Listener" webSocket messages.
   * Emit a 'message' event on an EventEmitter.
   * send a message object with type of ResponseMessageInterface
   */
  public getListenerEvents(): EventEmitter {
    return this.listenerEvents;
  }

  /**
   * can use to add listeners to the "Broadcaster" webSocket messages.
   * Emit a 'message' event on an EventEmitter.
   * send a message object with type of BroadcastMessageInterface
   */
  public getBroadcasterEvents(): EventEmitter {
    return this.broadCasterEvents;
  }

  private async connect(url): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('error', reject);
    });
  }
}
