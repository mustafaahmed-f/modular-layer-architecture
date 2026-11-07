import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAppInstance } from '../../../../tests/createAppInstance.js';
import {
    createPrismaError,
    prismaMock,
} from '../../../../tests/mocks/prisma.mock.js';
import {
    buildUser,
    MISSING_USER_ID,
    USER_ID,
} from '../../../../tests/mocks/user.fixtures.js';

const app = createAppInstance();
const validBody = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'Jane.Doe@example.com',
};

describe('Users API', () => {
    describe('POST /api/users', () => {
        it('creates a user (201)', async () => {
            prismaMock.user.create.mockResolvedValue(buildUser());

            const res = await request(app).post('/api/users').send(validBody);

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                success: true,
                message: 'User created successfully',
                data: { id: USER_ID, email: 'jane.doe@example.com' },
            });
            //* The controller receives the parsed (normalised) body.
            expect(prismaMock.user.create).toHaveBeenCalledWith({
                data: { ...validBody, email: 'jane.doe@example.com' },
            });
        });

        it('returns 400 with every validation issue', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({ firstName: '', email: 'bad' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Validation failed');
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        location: 'body',
                        path: 'firstName',
                    }),
                    expect.objectContaining({
                        location: 'body',
                        path: 'lastName',
                    }),
                    expect.objectContaining({
                        location: 'body',
                        path: 'email',
                    }),
                ])
            );
            expect(prismaMock.user.create).not.toHaveBeenCalled();
        });

        it('returns 409 for a duplicate email (P2002)', async () => {
            prismaMock.user.create.mockRejectedValue(
                createPrismaError('P2002', {
                    modelName: 'User',
                    target: ['email'],
                })
            );

            const res = await request(app).post('/api/users').send(validBody);

            expect(res.status).toBe(409);
            expect(res.body.message).toBe(
                'A record with this email already exists'
            );
        });
    });

    describe('GET /api/users', () => {
        it('lists users with pagination metadata', async () => {
            prismaMock.user.findMany.mockResolvedValue([buildUser()]);
            prismaMock.user.count.mockResolvedValue(1);

            const res = await request(app).get('/api/users?page=1&limit=5');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.meta).toEqual({
                pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
            });
        });

        it('rejects invalid query parameters', async () => {
            const res = await request(app).get('/api/users?sortBy=password');

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatchObject({
                location: 'query',
                path: 'sortBy',
            });
        });
    });

    describe('GET /api/users/:userId', () => {
        it('returns the user', async () => {
            prismaMock.user.findUnique.mockResolvedValue(buildUser());

            const res = await request(app).get(`/api/users/${USER_ID}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(USER_ID);
        });

        it('returns 404 when the user does not exist', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const res = await request(app).get(`/api/users/${MISSING_USER_ID}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found');
        });

        it('returns 400 for an invalid id', async () => {
            const res = await request(app).get('/api/users/not-a-cuid!');

            expect(res.status).toBe(400);
            expect(res.body.errors[0]).toMatchObject({ location: 'params' });
        });
    });

    describe('PATCH /api/users/:userId', () => {
        it('updates the user', async () => {
            prismaMock.user.update.mockResolvedValue(
                buildUser({ firstName: 'Janet' })
            );

            const res = await request(app)
                .patch(`/api/users/${USER_ID}`)
                .send({ firstName: 'Janet' });

            expect(res.status).toBe(200);
            expect(res.body.data.firstName).toBe('Janet');
        });

        it('returns 404 when the user does not exist (P2025)', async () => {
            prismaMock.user.update.mockRejectedValue(
                createPrismaError('P2025', { modelName: 'User' })
            );

            const res = await request(app)
                .patch(`/api/users/${MISSING_USER_ID}`)
                .send({ firstName: 'Janet' });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found');
        });

        it('rejects an empty update', async () => {
            const res = await request(app)
                .patch(`/api/users/${USER_ID}`)
                .send({});

            expect(res.status).toBe(400);
            expect(prismaMock.user.update).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/users/:userId', () => {
        it('deletes the user (204)', async () => {
            prismaMock.user.delete.mockResolvedValue(buildUser());

            const res = await request(app).delete(`/api/users/${USER_ID}`);

            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
        });

        it('returns 404 when the user does not exist (P2025)', async () => {
            prismaMock.user.delete.mockRejectedValue(
                createPrismaError('P2025', { modelName: 'User' })
            );

            const res = await request(app).delete(
                `/api/users/${MISSING_USER_ID}`
            );

            expect(res.status).toBe(404);
        });
    });
});
