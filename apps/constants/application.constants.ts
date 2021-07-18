import * as path from 'path';
import * as dotenv from 'dotenv';

const dotenvPath = path.join(__dirname, '../../', `config/.env.${process.env.NODE_ENV}`);
dotenv.config({
  path: dotenvPath,
});

export const BROADCAST_PORT: number = Number(process.env.BROADCAST_PORT);
export const LISTENER_PORT: number = Number(process.env.LISTENER_PORT);
export const LISTENER_CHANNEL: string = process.env.LISTENER_CHANNEL;
export const HOST: string = process.env.HOST;
export const REDIS_URL: string = process.env.REDIS_URL;
