import { LISTENER_CHANNEL, LISTENER_PORT, REDIS_URL } from '../constants/application.constants';
import { Logger } from '../common/helpers/logger';
import { Listener } from './listener';

const listenerPort = LISTENER_PORT;
const listenerChannel = LISTENER_CHANNEL;
const redisUrl = REDIS_URL;

const run = async () => {
  try {
    const listener = new Listener({ port: listenerPort, redisUrl, channel: listenerChannel });
    await listener.start();
  } catch (err) {
    Logger.error(err);
  }
};

run();
