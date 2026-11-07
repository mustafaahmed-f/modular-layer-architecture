import express, { type Application } from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createPrismaError } from '../mocks/prisma.mock.js';

/** Builds a tiny app whose only route throws `error`. */
async function appThrowing(
    error: unknown,
    nodeEnv: 'development' | 'production' = 'development'
): Promise<Application> {
    vi.resetModules();
    vi.doMock('../../config/env.js', () => ({
        isProduction: nodeEnv === 'production',
        isTest: true,
    }));
    const { errorHandler } = await import('../../middlewares/errorHandler.js');

    const app = express();
    app.get('/boom', () => {
        throw error;
    });
    app.use(errorHandler);
    return app;
}

describe('errorHandler', () => {
    afterEach(() => {
        vi.doUnmock('../../config/env.js');
    });

    it('maps P2002 to 409 with the conflicting fields', async () => {
        const app = await appThrowing(
            createPrismaError('P2002', { modelName: 'User', target: ['email'] })
        );

        const res = await request(app).get('/boom');

        expect(res.status).toBe(409);
        expect(res.body.message).toBe(
            'A record with this email already exists'
        );
        expect(res.body.errors).toEqual({ fields: ['email'] });
    });

    it('reads P2002 fields from the driver adapter error shape', async () => {
        const app = await appThrowing(
            createPrismaError('P2002', {
                modelName: 'User',
                driverAdapterError: {
                    cause: { constraint: { fields: ['email'] } },
                },
            })
        );

        const res = await request(app).get('/boom');

        expect(res.status).toBe(409);
        expect(res.body.errors).toEqual({ fields: ['email'] });
    });

    it('maps P2025 to 404 using the model name', async () => {
        const app = await appThrowing(
            createPrismaError('P2025', { modelName: 'User' })
        );

        const res = await request(app).get('/boom');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    it('maps P2003 to 409', async () => {
        const app = await appThrowing(createPrismaError('P2003'));

        const res = await request(app).get('/boom');

        expect(res.status).toBe(409);
    });

    it('maps a ZodError to 400 with formatted issues', async () => {
        const result = z.object({ age: z.number() }).safeParse({ age: 'x' });
        const app = await appThrowing(result.error);

        const res = await request(app).get('/boom');

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual([
            { path: 'age', message: expect.any(String) },
        ]);
    });

    it('includes the stack trace outside production', async () => {
        const app = await appThrowing(new Error('db password is hunter2'));

        const res = await request(app).get('/boom');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Internal server error');
        expect(res.body.stack).toContain('db password is hunter2');
    });

    it('hides stack traces and details in production', async () => {
        const app = await appThrowing(
            new Error('db password is hunter2'),
            'production'
        );

        const res = await request(app).get('/boom');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            message: 'Internal server error',
        });
    });

    it('never exposes unknown Prisma errors', async () => {
        const app = await appThrowing(
            createPrismaError('P1001', { database_host: 'secret-host' }),
            'production'
        );

        const res = await request(app).get('/boom');

        expect(res.status).toBe(500);
        expect(JSON.stringify(res.body)).not.toContain('secret-host');
    });
});
