import type { Prisma } from '../../../generated/prisma/client.js';

/**
 * Builds the `where` clause for the users list. MySQL's default collations
 * are case-insensitive, so `contains` already ignores case.
 */
export function buildUserSearchFilter(search?: string): Prisma.UserWhereInput {
    if (!search) return {};

    return {
        OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
        ],
    };
}
