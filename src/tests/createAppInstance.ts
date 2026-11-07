import type { Application } from 'express';
import { createApp } from '../app.js';

/** A fresh, non-listening Express app for supertest. */
export function createAppInstance(): Application {
    return createApp();
}
