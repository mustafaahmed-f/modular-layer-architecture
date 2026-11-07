import type { User } from '../../../generated/prisma/client.js';
import { prisma } from '../../../infrastructure/database/prisma.js';
import { AppError } from '../../../shared/errors/AppError.js';
import {
    buildPaginationMeta,
    getPaginationArgs,
    type PaginationMeta,
} from '../../../shared/utils/pagination.js';
import { buildUserSearchFilter } from '../utils/buildUserSearchFilter.js';
import type { CreateUserBody } from '../validations/createUser.validation.js';
import type { GetUsersQuery } from '../validations/getUsers.validation.js';
import type { UpdateUserBody } from '../validations/updateUser.validation.js';

export interface PaginatedUsers {
    items: User[];
    pagination: PaginationMeta;
}

/** Duplicate emails surface as Prisma P2002 and become a 409 globally. */
export async function createUser(data: CreateUserBody): Promise<User> {
    return prisma.user.create({ data });
}

export async function getUsers(query: GetUsersQuery): Promise<PaginatedUsers> {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where = buildUserSearchFilter(search);

    const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            ...getPaginationArgs(page, limit),
        }),
        prisma.user.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw AppError.notFound('User not found');
    }

    return user;
}

/** A missing user surfaces as Prisma P2025 and becomes a 404 globally. */
export async function updateUser(
    userId: string,
    data: UpdateUserBody
): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data });
}

export async function deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({ where: { id: userId } });
}
