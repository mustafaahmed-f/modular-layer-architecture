import { z } from 'zod';
import { createUserBodySchema } from './createUser.validation.js';

export const updateUserBodySchema = createUserBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'Provide at least one field to update',
    });

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
