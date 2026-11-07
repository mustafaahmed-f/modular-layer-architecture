import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getValidated } from '../../../middlewares/validationMiddleware.js';
import * as userService from '../services/user.service.js';
import { userIdParamsSchema } from '../validations/userIdParams.validation.js';

export async function deleteUserController(
    req: Request,
    res: Response
): Promise<void> {
    const { userId } = getValidated(req, 'params', userIdParamsSchema);

    await userService.deleteUser(userId);

    res.status(StatusCodes.NO_CONTENT).send();
}
