export interface ApiSuccessResponse<T> {
    success: true;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
    stack?: string;
}

export function successResponse<T>(
    message: string,
    data: T,
    meta?: Record<string, unknown>
): ApiSuccessResponse<T> {
    return { success: true, message, data, ...(meta && { meta }) };
}

export function errorResponse(
    message: string,
    errors?: unknown,
    stack?: string
): ApiErrorResponse {
    return {
        success: false,
        message,
        ...(errors !== undefined && { errors }),
        ...(stack && { stack }),
    };
}
