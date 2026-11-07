import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getValidated } from '../../../middlewares/validationMiddleware.js';
import { successResponse } from '../../../shared/helpers/apiResponse.js';
import * as userService from '../services/user.service.js';
import { createUserBodySchema } from '../validations/createUser.validation.js';

export async function createUserController(
    req: Request,
    res: Response
): Promise<void> {
    const body = getValidated(req, 'body', createUserBodySchema);

    const user = await userService.createUser(body);

    res.status(StatusCodes.CREATED).json(
        successResponse('User created successfully', user)
    );
}
