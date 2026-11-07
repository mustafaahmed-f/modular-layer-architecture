import { StatusCodes } from 'http-status-codes';
import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from './AppError.js';

type PrismaErrorMeta = Record<string, unknown> | undefined;

/**
 * Collects the fields involved in a constraint error. Prisma reports them as
 * `meta.target` with classic engines and inside `meta.driverAdapterError`
 * when a driver adapter (MariaDB) is used, so both shapes are supported.
 */
function getConstraintFields(meta: PrismaErrorMeta): string[] {
    if (!meta) return [];

    const target = meta['target'];
    if (Array.isArray(target)) return target.map(String);
    if (typeof target === 'string') return [target];

    const adapterError = meta['driverAdapterError'] as
        | { cause?: { constraint?: { fields?: unknown; index?: unknown } } }
        | undefined;
    const constraint = adapterError?.cause?.constraint;
    if (Array.isArray(constraint?.fields)) return constraint.fields.map(String);
    if (typeof constraint?.index === 'string') return [constraint.index];

    return [];
}

function getModelName(meta: PrismaErrorMeta): string {
    const modelName = meta?.['modelName'];
    return typeof modelName === 'string' ? modelName : 'Record';
}

/** Turns known Prisma errors into safe AppErrors; returns null otherwise. */
export function mapPrismaError(error: unknown): AppError | null {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const meta = error.meta as PrismaErrorMeta;

        switch (error.code) {
            case 'P2002': {
                const fields = getConstraintFields(meta);
                const message = fields.length
                    ? `A record with this ${fields.join(', ')} already exists`
                    : 'A record with these values already exists';
                return AppError.conflict(
                    message,
                    fields.length ? { fields } : undefined
                );
            }
            case 'P2025':
                return AppError.notFound(`${getModelName(meta)} not found`);
            case 'P2003':
                return AppError.conflict(
                    'Operation violates a relation constraint (related record missing or still referenced)'
                );
            default:
                return null;
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return AppError.badRequest('Invalid data sent to the database');
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        return new AppError(
            'Database is unavailable',
            StatusCodes.SERVICE_UNAVAILABLE
        );
    }

    return null;
}
