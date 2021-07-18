import { BROADCAST_PORT, HOST, REDIS_URL } from '../apps/constants/application.constants';
import { Broadcaster } from '../apps/broadcaster/broadcaster';
import { Client } from '../apps/client/client';
import { expect } from 'chai';
import {
  BroadcastMessageInterface,
  ResponseMessageInterface,
} from '../apps/common/interfaces/message.interface';
import { v4 as uuid_v4 } from 'uuid';
import { MessageQueue } from '../apps/message-queue/message-queue';

const broadcastPort = BROADCAST_PORT;
const redisUrl = REDIS_URL;
const host = HOST;
const listenerChannel = 'test';

let broadcaster: Broadcaster;

describe('Receiver', () => {
  before((done) => {
    broadcaster = new Broadcaster({ port: broadcastPort, redisUrl });
    broadcaster.start().then(done);
  });

  it('Client can connect', (done) => {
    const client = new Client({
      clientId: 'broadcaster',
      broadcasterUrl: `ws://${host}:${broadcastPort}`,
    });

    client.start().then(done);
  });

  it('Throw error at bad url', (done) => {
    const client = new Client({
      clientId: 'broadcaster',
      broadcasterUrl: `ws://test:1000`,
    });

    client.start().catch((err) => {
      expect(err.message).to.eql('Connection failed');
      done();
    });
  });

  it('Client can broadcast', (done) => {
    const client = new Client({
      clientId: 'broadcaster',
      broadcasterUrl: `ws://${host}:${broadcastPort}`,
    });

    const messageData: BroadcastMessageInterface = {
      id: uuid_v4(),
      channel: listenerChannel,
      message: 'test message',
    };

    client.start().then(() => {
      client.broadcast(messageData).then(done);
    });
  });

  it('Broadcast response message is success', (done) => {
    const client = new Client({
      clientId: 'broadcaster',
      broadcasterUrl: `ws://${host}:${broadcastPort}`,
    });

    const messageData: BroadcastMessageInterface = {
      id: uuid_v4(),
      channel: listenerChannel,
      message: 'test message',
    };

    client.start().then(() => {
      const events = client.getBroadcasterEvents();
      events.on('message', (respMessageObj: ResponseMessageInterface) => {
        expect(respMessageObj.message.id).eql(messageData.id);
        expect(respMessageObj.isSuccess).eql(true);
        done();
      });

      client.broadcast(messageData);
    });
  });

  it('Message is available in the queue', (done) => {
    const client = new Client({
      clientId: 'broadcaster',
      broadcasterUrl: `ws://${host}:${broadcastPort}`,
    });

    const queue = new MessageQueue(redisUrl);

    const id = uuid_v4();

    client.start().then(() => {
      const messageData: BroadcastMessageInterface = {
        id,
        channel: listenerChannel,
        message: 'test message',
      };

      client.broadcast(messageData).then(() => {
        queue.subscribe(listenerChannel).then((subscriber) => {
          subscriber.on('message', (receivedChannel, message) => {
            expect(receivedChannel).eql(listenerChannel);
            const receivedMessageData: BroadcastMessageInterface = JSON.parse(message);
            expect(receivedMessageData.id).eql(id);
            done();
          });
        });
      });
    });
  });

  after(() => {
    broadcaster.close();
  });
});
