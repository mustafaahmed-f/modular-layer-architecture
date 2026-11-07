import type { ZodError } from 'zod';

export type RequestPart = 'body' | 'params' | 'query';

export interface ValidationIssue {
    location?: RequestPart;
    path: string;
    message: string;
}

export function formatZodIssues(
    error: ZodError,
    location?: RequestPart
): ValidationIssue[] {
    return error.issues.map((issue) => ({
        ...(location && { location }),
        path: issue.path.map(String).join('.'),
        message: issue.message,
    }));
}
