import cors from 'cors';
import express, { type Application } from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { apiRouter } from './routes.js';
import { API_PREFIX } from './shared/constants/app.constants.js';
import { successResponse } from './shared/helpers/apiResponse.js';

/**
 * Builds the Express application: global middleware, routes and error
 * handling. It never starts listening, so tests can import it freely.
 */
export function createApp(): Application {
    const app = express();

    app.disable('x-powered-by');
    app.set('trust proxy', 1);

    app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));

    if (env.NODE_ENV !== 'test') {
        app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    }

    app.get('/health', (_req, res) => {
        res.json(
            successResponse('OK', {
                status: 'ok',
                uptime: Math.round(process.uptime()),
            })
        );
    });

    app.use(API_PREFIX, apiRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
