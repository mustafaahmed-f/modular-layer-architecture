import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getValidated } from '../../../middlewares/validationMiddleware.js';
import { successResponse } from '../../../shared/helpers/apiResponse.js';
import * as userService from '../services/user.service.js';
import { updateUserBodySchema } from '../validations/updateUser.validation.js';
import { userIdParamsSchema } from '../validations/userIdParams.validation.js';

export async function updateUserController(
    req: Request,
    res: Response
): Promise<void> {
    const { userId } = getValidated(req, 'params', userIdParamsSchema);
    const body = getValidated(req, 'body', updateUserBodySchema);

    const user = await userService.updateUser(userId, body);

    res.status(StatusCodes.OK).json(
        successResponse('User updated successfully', user)
    );
}
