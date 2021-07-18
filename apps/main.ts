import { v4 as uuid_v4 } from 'uuid';
import { Broadcaster } from './broadcaster/broadcaster';
import { Client } from './client/client';
import { Logger } from './common/helpers/logger';
import { Listener } from './listener/listener';
import { BroadcastMessageInterface } from './common/interfaces/message.interface';
import {
  BROADCAST_PORT,
  HOST,
  LISTENER_CHANNEL,
  LISTENER_PORT,
  REDIS_URL,
} from './constants/application.constants';

const broadcastPort = BROADCAST_PORT;
const listenerPort = LISTENER_PORT;
const listenerChannel = LISTENER_CHANNEL;
const host = HOST;
const redisUrl = REDIS_URL;

const run = async () => {
  try {
    // BROADCASTER
    const broadcaster = new Broadcaster({ port: broadcastPort, redisUrl });
    await broadcaster.start();

    // LISTENER
    const listener = new Listener({ port: listenerPort, redisUrl, channel: listenerChannel });
    await listener.start();

    // CLIENTS
    const listenerClient = new Client({
      clientId: 'listener',
      listenerUrl: `ws://${host}:${listenerPort}`,
    });
    await listenerClient.start();
    const listenerClientEvents = listenerClient.getListenerEvents();
    listenerClientEvents.on('message', (message: BroadcastMessageInterface) => {
      Logger.info(`listener client get message: ${JSON.stringify(message)}`);
    });

    const listener2Client = new Client({
      clientId: 'listener2',
      listenerUrl: `ws://${host}:${listenerPort}`,
    });
    await listener2Client.start();
    const listener2ClientEvents = listener2Client.getListenerEvents();
    listener2ClientEvents.on('message', (message: BroadcastMessageInterface) => {
      Logger.info(`listener2 client get message: ${JSON.stringify(message)}`);
    });

    const client = new Client({
      clientId: 'broadcaster',
      broadcasterUrl: `ws://${host}:${broadcastPort}`,
    });
    await client.start();

    const messageData: BroadcastMessageInterface = {
      id: uuid_v4(),
      channel: listenerChannel,
      message: 'test message',
    };

    await client.broadcast(messageData);
  } catch (err) {
    Logger.error(err);
  }
};

run();
