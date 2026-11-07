import type { Server } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectRedis, disconnectRedis } from './infrastructure/cache/redis.js';
import {
    connectDatabase,
    disconnectDatabase,
} from './infrastructure/database/prisma.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | undefined;
let isShuttingDown = false;

async function shutdown(reason: string, exitCode = 0): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${reason} received - shutting down gracefully...`);

    //* Force exit if something hangs (open connections, stuck queries...).
    const forceExit = setTimeout(() => {
        console.error('Graceful shutdown timed out - forcing exit.');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
        if (server) {
            await new Promise<void>((resolve, reject) =>
                server!.close((error) => (error ? reject(error) : resolve()))
            );
        }
        await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
        console.log('Shutdown complete.');
    } catch (error) {
        console.error('Error during shutdown:', error);
        exitCode = 1;
    } finally {
        process.exit(exitCode);
    }
}

async function bootstrap(): Promise<void> {
    await connectDatabase();
    console.log('Database connected.');

    await connectRedis();

    const app = createApp();
    server = app.listen(env.PORT, () => {
        console.log(`[${env.NODE_ENV}] Server is running on port ${env.PORT}`);
    });

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
    void shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    void shutdown('uncaughtException', 1);
});

bootstrap().catch(async (error: unknown) => {
    console.error('Failed to start the server:', error);
    await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
    process.exit(1);
});
