import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from '../../config/env.js';
import { PrismaClient } from '../../generated/prisma/client.js';

//* Safety net: tests mock this module (src/tests/setup.ts). If a test ever
//* imports the real client, refuse anything that is not a *_test database.
if (env.NODE_ENV === 'test' && !env.DATABASE_NAME.endsWith('_test')) {
    throw new Error(
        `Refusing to use database "${env.DATABASE_NAME}" in tests: the name must end with "_test".`
    );
}

const adapter = new PrismaMariaDb({
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    connectionLimit: env.DATABASE_CONNECTION_LIMIT,

    allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    errorFormat: env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
});

/** Opens the pool and runs a trivial query so startup fails fast. */
export async function connectDatabase(): Promise<void> {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
}
