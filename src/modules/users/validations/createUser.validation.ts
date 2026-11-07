import { z } from 'zod';

const nameSchema = (field: string) =>
    z
        .string(`${field} is required`)
        .trim()
        .min(1, `${field} is required`)
        .max(100, `${field} must be at most 100 characters`);

export const createUserBodySchema = z.object({
    firstName: nameSchema('firstName'),
    lastName: nameSchema('lastName'),
    email: z
        .string('email is required')
        .trim()
        .toLowerCase()
        .max(255, 'email must be at most 255 characters')
        .pipe(z.email('email must be a valid email address')),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
