import { vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';

/**
 * Stand-in for the Prisma client used by every test (wired up in setup.ts).
 * Add the model delegates/methods your services use as the app grows.
 */
export const prismaMock = {
    user: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
};

/** Restores default behaviour after `vi.resetAllMocks()`. */
export function resetPrismaMock(): void {
    //* Supports both forms: $transaction([...promises]) and $transaction(fn).
    prismaMock.$transaction.mockImplementation((arg: unknown) =>
        Array.isArray(arg)
            ? Promise.all(arg)
            : (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
    );
}

/** Builds a real Prisma known-request error (P2002, P2025, P2003, ...). */
export function createPrismaError(
    code: string,
    meta?: Record<string, unknown>
): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError(`Mocked ${code}`, {
        code,
        clientVersion: 'test',
        meta,
    });
}
