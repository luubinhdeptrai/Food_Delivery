import { Global, Module, Logger } from '@nestjs/common';
import { Redis, type RedisOptions } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants.js';
import { RedisService } from './redis.service.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('RedisModule');

        // Prefer REDIS_URL (set by Render, Railway, etc.) over individual host/port vars.
        // rediss:// → TLS required; redis:// → plain TCP.
        const redisUrl = process.env.REDIS_URL;

        let options: RedisOptions;

        if (redisUrl) {
          const isTls = redisUrl.startsWith('rediss://');
          options = {
            // Parse the URL string directly; ioredis accepts a connection URL
            // when passed via the `host` trick — instead we use the lazyConnect
            // path with an explicit URL below via the Redis(url, options) overload.
            // We store the URL in a side variable and use the two-arg constructor.
            ...(isTls && {
              tls: {
                // Render's managed Redis uses a self-signed cert; allow it.
                rejectUnauthorized: false,
              },
            }),
            // Exponential back-off capped at 3 s; stops after 10 attempts
            retryStrategy: (times: number) =>
              times > 10 ? null : Math.min(times * 200, 3000),
          };

          logger.log(
            `Connecting to Redis via REDIS_URL (TLS=${isTls ? 'yes' : 'no'})`,
          );

          const client = new Redis(redisUrl, options);

          client.on('connect', () => logger.log('Redis connected'));
          client.on('error', (err: Error) =>
            logger.error('Redis error', err.message),
          );
          client.on('close', () => logger.warn('Redis connection closed'));

          return client;
        }

        // Local / Docker Compose fallback: individual host + port env vars.
        options = {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          // Exponential back-off capped at 3 s; stops after 10 attempts
          retryStrategy: (times: number) =>
            times > 10 ? null : Math.min(times * 200, 3000),
        };

        logger.log(
          `Connecting to Redis via host=${options.host} port=${options.port}`,
        );

        const client = new Redis(options);

        client.on('connect', () => logger.log('Redis connected'));
        client.on('error', (err: Error) =>
          logger.error('Redis error', err.message),
        );
        client.on('close', () => logger.warn('Redis connection closed'));

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
