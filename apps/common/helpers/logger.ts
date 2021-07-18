import * as winston from 'winston';

export const Logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.simple(),
    }),
  ],
});
