import type { RequestPart } from '../utils/formatZodIssues.js';

declare global {
    namespace Express {
        interface Request {
            /** Parsed output of the schemas given to `validationMiddleware`. */
            validated?: Partial<Record<RequestPart, unknown>>;
        }
    }
}

export {};
