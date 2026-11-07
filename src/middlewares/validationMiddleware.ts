import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z, ZodType } from 'zod';
import { AppError } from '../shared/errors/AppError.js';
import {
    formatZodIssues,
    type RequestPart,
    type ValidationIssue,
} from '../shared/utils/formatZodIssues.js';

export type ValidationSchemas = Partial<Record<RequestPart, ZodType>>;

const REQUEST_PARTS: RequestPart[] = ['params', 'query', 'body'];

/**
 * Validates `params`, `query` and/or `body` with Zod. Every part is checked so
 * the client gets all problems at once. Parsed values (with defaults, coercion
 * and transforms applied) are stored on `req.validated`; `req.body` is also
 * replaced. Read them in controllers with `getValidated`.
 */
export function validationMiddleware(
    schemas: ValidationSchemas
): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const issues: ValidationIssue[] = [];
        const validated: NonNullable<Request['validated']> = {};

        for (const part of REQUEST_PARTS) {
            const schema = schemas[part];
            if (!schema) continue;

            const result = schema.safeParse(req[part]);
            if (result.success) {
                validated[part] = result.data;
            } else {
                issues.push(...formatZodIssues(result.error, part));
            }
        }

        if (issues.length > 0) {
            return next(AppError.badRequest('Validation failed', issues));
        }

        req.validated = validated;
        if (validated.body !== undefined) req.body = validated.body;

        return next();
    };
}

/**
 * Typed access to validated data. Pass the same schema used in the route so
 * the return type is inferred from it:
 *
 *   const body = getValidated(req, 'body', createUserBodySchema);
 */
export function getValidated<TSchema extends ZodType>(
    req: Request,
    part: RequestPart,
    _schema: TSchema
): z.output<TSchema> {
    if (!req.validated || !(part in req.validated)) {
        throw new Error(
            `No validated "${part}" on the request. Add validationMiddleware({ ${part}: schema }) to the route.`
        );
    }
    return req.validated[part] as z.output<TSchema>;
}
