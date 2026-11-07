import { Redis } from 'ioredis';
import { env } from '../../config/env.js';

/**
 * Optional Redis integration. It is only started when REDIS_URL is set;
 * otherwise every function here is a safe no-op and `getRedis()` throws.
 */
let client: Redis | null = null;

export function isRedisEnabled(): boolean {
    return Boolean(env.REDIS_URL);
}

export async function connectRedis(): Promise<void> {
    if (!env.REDIS_URL || client) return;

    client = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
    });
    client.on('error', (error) => console.error('Redis error:', error));

    await client.connect();
}

export function getRedis(): Redis {
    if (!client) {
        throw new Error(
            'Redis is not connected. Set REDIS_URL and call connectRedis() on startup.'
        );
    }
    return client;
}

export async function disconnectRedis(): Promise<void> {
    if (!client) return;
    await client.quit();
    client = null;
}
