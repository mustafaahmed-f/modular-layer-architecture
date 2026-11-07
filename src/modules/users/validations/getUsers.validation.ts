import { z } from 'zod';
import {
    PAGINATION,
    SORT_ORDERS,
} from '../../../shared/constants/app.constants.js';

export const USER_SORT_FIELDS = [
    'createdAt',
    'firstName',
    'lastName',
    'email',
] as const;

export const getUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(PAGINATION.MAX_LIMIT)
        .default(PAGINATION.DEFAULT_LIMIT),
    search: z.string().trim().min(1).max(100).optional(),
    sortBy: z.enum(USER_SORT_FIELDS).default('createdAt'),
    sortOrder: z.enum(SORT_ORDERS).default('desc'),
});

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
