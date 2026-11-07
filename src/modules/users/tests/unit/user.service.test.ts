import { describe, expect, it } from 'vitest';
import { AppError } from '../../../../shared/errors/AppError.js';
import {
    createPrismaError,
    prismaMock,
} from '../../../../tests/mocks/prisma.mock.js';
import { buildUser, USER_ID } from '../../../../tests/mocks/user.fixtures.js';
import * as userService from '../../services/user.service.js';

describe('user.service', () => {
    describe('createUser', () => {
        it('creates the user with the given data', async () => {
            const user = buildUser();
            prismaMock.user.create.mockResolvedValue(user);
            const data = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
            };

            await expect(userService.createUser(data)).resolves.toEqual(user);
            expect(prismaMock.user.create).toHaveBeenCalledWith({ data });
        });

        it('lets unique-constraint errors bubble up to the error handler', async () => {
            prismaMock.user.create.mockRejectedValue(
                createPrismaError('P2002', { target: ['email'] })
            );

            await expect(
                userService.createUser({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane.doe@example.com',
                })
            ).rejects.toMatchObject({ code: 'P2002' });
        });
    });

    describe('getUsers', () => {
        it('paginates, sorts and filters inside one transaction', async () => {
            const users = [buildUser()];
            prismaMock.user.findMany.mockResolvedValue(users);
            prismaMock.user.count.mockResolvedValue(21);

            const result = await userService.getUsers({
                page: 3,
                limit: 10,
                search: 'jane',
                sortBy: 'lastName',
                sortOrder: 'asc',
            });

            expect(prismaMock.$transaction).toHaveBeenCalledOnce();
            expect(prismaMock.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 20,
                    take: 10,
                    orderBy: { lastName: 'asc' },
                    where: expect.objectContaining({ OR: expect.any(Array) }),
                })
            );
            expect(result).toEqual({
                items: users,
                pagination: { page: 3, limit: 10, total: 21, totalPages: 3 },
            });
        });
    });

    describe('getUserById', () => {
        it('returns the user when found', async () => {
            const user = buildUser();
            prismaMock.user.findUnique.mockResolvedValue(user);

            await expect(userService.getUserById(USER_ID)).resolves.toEqual(
                user
            );
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: USER_ID },
            });
        });

        it('throws a 404 AppError when the user does not exist', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const promise = userService.getUserById(USER_ID);

            await expect(promise).rejects.toBeInstanceOf(AppError);
            await expect(promise).rejects.toMatchObject({
                statusCode: 404,
                message: 'User not found',
            });
        });
    });

    describe('updateUser', () => {
        it('updates the user by id', async () => {
            const user = buildUser({ firstName: 'Janet' });
            prismaMock.user.update.mockResolvedValue(user);

            await expect(
                userService.updateUser(USER_ID, { firstName: 'Janet' })
            ).resolves.toEqual(user);
            expect(prismaMock.user.update).toHaveBeenCalledWith({
                where: { id: USER_ID },
                data: { firstName: 'Janet' },
            });
        });
    });

    describe('deleteUser', () => {
        it('deletes the user by id', async () => {
            prismaMock.user.delete.mockResolvedValue(buildUser());

            await expect(
                userService.deleteUser(USER_ID)
            ).resolves.toBeUndefined();
            expect(prismaMock.user.delete).toHaveBeenCalledWith({
                where: { id: USER_ID },
            });
        });
    });
});
