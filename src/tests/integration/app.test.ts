import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAppInstance } from '../createAppInstance.js';

describe('application wiring', () => {
    const app = createAppInstance();

    it('answers the health check', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            data: { status: 'ok' },
        });
    });

    it.each(['/nope', '/api/nope'])(
        'returns a JSON 404 for %s',
        async (path) => {
            const res = await request(app).get(path);

            expect(res.status).toBe(404);
            expect(res.body).toMatchObject({
                success: false,
                message: `Route not found: GET ${path}`,
            });
        }
    );

    it('rejects malformed JSON with 400', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"firstName":');

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            success: false,
            message: 'Malformed JSON in request body',
        });
    });
});
