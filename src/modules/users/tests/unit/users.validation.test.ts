import { describe, expect, it } from 'vitest';
import { createUserBodySchema } from '../../validations/createUser.validation.js';
import { getUsersQuerySchema } from '../../validations/getUsers.validation.js';
import { updateUserBodySchema } from '../../validations/updateUser.validation.js';
import { userIdParamsSchema } from '../../validations/userIdParams.validation.js';

describe('users validations', () => {
    describe('createUserBodySchema', () => {
        it('trims names and normalises the email', () => {
            const result = createUserBodySchema.parse({
                firstName: '  Jane ',
                lastName: ' Doe',
                email: '  Jane.Doe@Example.COM ',
            });

            expect(result).toEqual({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
            });
        });

        it.each([
            [{ lastName: 'Doe', email: 'jane@example.com' }, 'firstName'],
            [
                {
                    firstName: 'Jane',
                    lastName: '   ',
                    email: 'jane@example.com',
                },
                'lastName',
            ],
            [
                { firstName: 'Jane', lastName: 'Doe', email: 'not-an-email' },
                'email',
            ],
        ])('rejects %j (bad %s)', (input, field) => {
            const result = createUserBodySchema.safeParse(input);

            expect(result.success).toBe(false);
            expect(result.error?.issues[0]?.path).toEqual([field]);
        });
    });

    describe('updateUserBodySchema', () => {
        it('accepts a partial update', () => {
            expect(updateUserBodySchema.parse({ lastName: 'Smith' })).toEqual({
                lastName: 'Smith',
            });
        });

        it('rejects an empty body', () => {
            expect(updateUserBodySchema.safeParse({}).success).toBe(false);
        });
    });

    describe('getUsersQuerySchema', () => {
        it('applies defaults', () => {
            expect(getUsersQuerySchema.parse({})).toEqual({
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });
        });

        it('coerces query-string numbers', () => {
            expect(
                getUsersQuerySchema.parse({ page: '2', limit: '25' })
            ).toMatchObject({ page: 2, limit: 25 });
        });

        it('caps the page size', () => {
            expect(
                getUsersQuerySchema.safeParse({ limit: '1000' }).success
            ).toBe(false);
        });
    });

    describe('userIdParamsSchema', () => {
        it('rejects ids that are not cuids', () => {
            expect(
                userIdParamsSchema.safeParse({ userId: '123' }).success
            ).toBe(false);
        });
    });
});
