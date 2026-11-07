import type { User } from '../../generated/prisma/client.js';

export const USER_ID = 'cmh1a2b3c0000d4e5f6g7h8i9';
export const MISSING_USER_ID = 'cmh9z8y7x0000w6v5u4t3s2r1';

export function buildUser(overrides: Partial<User> = {}): User {
    return {
        id: USER_ID,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}
