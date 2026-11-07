import 'dotenv/config';
import { z } from 'zod';

/** Treats empty strings (e.g. `REDIS_URL=`) as "not set". */
const optionalString = z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).optional()
);

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().int().min(0).max(65535).default(3000),
    CORS_ORIGINS: z
        .string()
        .default('http://localhost:3000')
        .transform((value) =>
            value
                .split(',')
                .map((origin) => origin.trim())
                .filter(Boolean)
        ),

    //* Runtime connection used by the Prisma MariaDB adapter.
    DATABASE_HOST: z.string().trim().min(1),
    DATABASE_PORT: z.coerce.number().int().positive().default(3306),
    DATABASE_USER: z.string().trim().min(1),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string().trim().min(1),
    DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().default(5),

    //* Optional integrations: leave empty to disable them.
    REDIS_URL: optionalString,
    CLOUDINARY_CLOUD_NAME: optionalString,
    CLOUDINARY_API_KEY: optionalString,
    CLOUDINARY_API_SECRET: optionalString,
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const problems = result.error.issues
            .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
        throw new Error(`Invalid environment variables:\n${problems}`);
    }

    return result.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
