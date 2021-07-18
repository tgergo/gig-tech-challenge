import { HOST, LISTENER_PORT, REDIS_URL } from '../apps/constants/application.constants';
import { Client } from '../apps/client/client';
import { expect } from 'chai';
import { BroadcastMessageInterface } from '../apps/common/interfaces/message.interface';
import { v4 as uuid_v4 } from 'uuid';
import { MessageQueue } from '../apps/message-queue/message-queue';
import { Listener } from '../apps/listener/listener';

const redisUrl = REDIS_URL;
const host = HOST;
const listenerChannel = 'test1';
const listenerPort = LISTENER_PORT;

let listener: Listener;

describe('Listener', () => {
  before((done) => {
    listener = new Listener({ port: listenerPort, redisUrl, channel: listenerChannel });
    listener.start().then(done);
  });

  it('Client can connect', (done) => {
    const listenerClient = new Client({
      clientId: 'listener',
      listenerUrl: `ws://${host}:${listenerPort}`,
    });
    listenerClient.start().then(done);
  });

  it('Throw error at bad url', (done) => {
    const client = new Client({
      clientId: 'listener',
      broadcasterUrl: `ws://test:1000`,
    });

    client.start().catch((err) => {
      expect(err.message).to.eql('Connection failed');
      done();
    });
  });

  it('Send message to the client from the queue', (done) => {
    const queue = new MessageQueue(redisUrl);
    const id = uuid_v4();

    const messageDataForPublish: BroadcastMessageInterface = {
      id,
      channel: listenerChannel,
      message: 'test message',
    };

    const listenerClient = new Client({
      clientId: 'listener',
      listenerUrl: `ws://${host}:${listenerPort}`,
    });

    listenerClient.start().then(() => {
      const events = listenerClient.getListenerEvents();
      events.on('message', (message: BroadcastMessageInterface) => {
        expect(message.id).eql(messageDataForPublish.id);
        done();
      });

      queue.publish(listenerChannel, JSON.stringify(messageDataForPublish));
    });
  });

  after(() => {
    listener.close();
  });
});
