import { BROADCAST_PORT, REDIS_URL } from '../constants/application.constants';
import { Logger } from '../common/helpers/logger';
import { Broadcaster } from './broadcaster';

const broadcastPort = BROADCAST_PORT;
const redisUrl = REDIS_URL;

const run = async () => {
  try {
    const broadcaster = new Broadcaster({ port: broadcastPort, redisUrl });
    await broadcaster.start();
  } catch (err) {
    Logger.error(err);
  }
};

run();
