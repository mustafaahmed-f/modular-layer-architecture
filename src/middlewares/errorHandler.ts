import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { isProduction, isTest } from '../config/env.js';
import { AppError } from '../shared/errors/AppError.js';
import { mapPrismaError } from '../shared/errors/prismaErrorMapper.js';
import { errorResponse } from '../shared/helpers/apiResponse.js';
import { formatZodIssues } from '../shared/utils/formatZodIssues.js';

/** Errors created by Express/body-parser/http-errors carry a status. */
interface HttpLikeError {
    status?: number;
    statusCode?: number;
    expose?: boolean;
    type?: string;
    message?: string;
}

/** multer is detected by shape so this file does not depend on it. */
function isMulterError(
    error: unknown
): error is { name: 'MulterError'; code: string; message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        (error as { name?: unknown }).name === 'MulterError'
    );
}

function toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;

    if (error instanceof ZodError) {
        return AppError.badRequest('Validation failed', formatZodIssues(error));
    }

    const prismaError = mapPrismaError(error);
    if (prismaError) return prismaError;

    if (isMulterError(error)) {
        const status =
            error.code === 'LIMIT_FILE_SIZE'
                ? StatusCodes.REQUEST_TOO_LONG
                : StatusCodes.BAD_REQUEST;
        return new AppError(error.message, status);
    }

    const httpError = error as HttpLikeError | null;
    const status = httpError?.status ?? httpError?.statusCode;
    if (status && status >= 400 && status < 500) {
        const message =
            httpError?.type === 'entity.parse.failed'
                ? 'Malformed JSON in request body'
                : httpError?.expose && httpError.message
                  ? httpError.message
                  : 'Bad request';
        return new AppError(message, status);
    }

    return new AppError('Internal server error');
}

/**
 * Global error handler - must be registered last. Never leaks stack traces or
 * database details in production.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
    const appError = toAppError(error);
    const isServerError = appError.statusCode >= 500;

    if (isServerError && !isTest) {
        console.error(`[${req.method} ${req.originalUrl}]`, error);
    }

    const message =
        isServerError && isProduction
            ? 'Internal server error'
            : appError.message;
    const details =
        isServerError && isProduction ? undefined : appError.details;
    const stack =
        !isProduction && error instanceof Error ? error.stack : undefined;

    res.status(appError.statusCode).json(
        errorResponse(message, details, stack)
    );
};
