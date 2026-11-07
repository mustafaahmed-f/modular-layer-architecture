import { Router } from 'express';
import usersRoutes from './modules/users/users.routes.js';

/** Aggregates every module router under the API prefix (see app.ts). */
export const apiRouter = Router();

apiRouter.use('/users', usersRoutes);
