import { StatusCodes } from 'http-status-codes';

/**
 * An expected, operational error. Throw it from services (or anywhere) and the
 * global error handler turns it into a JSON response with `statusCode`.
 *
 * Services should prefer the static factories so they never deal with HTTP
 * status codes directly.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
        details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }

    static badRequest(message = 'Bad request', details?: unknown): AppError {
        return new AppError(message, StatusCodes.BAD_REQUEST, details);
    }

    static unauthorized(message = 'Unauthorized'): AppError {
        return new AppError(message, StatusCodes.UNAUTHORIZED);
    }

    static forbidden(message = 'Forbidden'): AppError {
        return new AppError(message, StatusCodes.FORBIDDEN);
    }

    static notFound(message = 'Resource not found'): AppError {
        return new AppError(message, StatusCodes.NOT_FOUND);
    }

    static conflict(message = 'Conflict', details?: unknown): AppError {
        return new AppError(message, StatusCodes.CONFLICT, details);
    }
}
