import { defineConfig } from 'vitest/config';

export default defineConfig({
    logLevel: 'error',
    test: {
        environment: 'node',
        include: ['src/**/tests/**/*.test.ts'],
        setupFiles: ['src/tests/setup.ts'],
        //* Placeholder values: tests never load a real database. The Prisma
        //* client is mocked in src/tests/setup.ts, and these values win over
        //* anything in .env because dotenv never overrides existing variables.
        env: {
            NODE_ENV: 'test',
            PORT: '0',
            CORS_ORIGINS: 'http://localhost:3000',
            DATABASE_HOST: 'localhost',
            DATABASE_PORT: '3306',
            DATABASE_USER: 'test',
            DATABASE_PASSWORD: 'test',
            DATABASE_NAME: 'app_test',
            DATABASE_URL: 'mysql://test:test@localhost:3306/app_test',
            REDIS_URL: '',
            CLOUDINARY_CLOUD_NAME: '',
            CLOUDINARY_API_KEY: '',
            CLOUDINARY_API_SECRET: '',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: ['src/**/*.ts'],
            exclude: [
                'src/generated/**',
                'src/tests/**',
                'src/**/tests/**',
                'src/**/types/**',
                'src/server.ts',
                'src/infrastructure/**',
            ],
        },
    },
});
