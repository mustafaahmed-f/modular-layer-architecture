import { afterEach, beforeEach, vi } from 'vitest';
import { resetPrismaMock } from './mocks/prisma.mock.js';

/**
 * Applied to every test file (see vitest.config.ts), so no test can reach a
 * real database even if it forgets to mock Prisma.
 */
vi.mock('../infrastructure/database/prisma.js', async () => ({
    prisma: (await import('./mocks/prisma.mock.js')).prismaMock,
    connectDatabase: vi.fn(),
    disconnectDatabase: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
    resetPrismaMock();
});

afterEach(() => {
    vi.restoreAllMocks();
});
