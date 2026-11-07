import { z } from 'zod';

export const userIdParamsSchema = z.object({
    userId: z.cuid('userId must be a valid id'),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
