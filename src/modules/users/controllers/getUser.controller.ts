import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getValidated } from '../../../middlewares/validationMiddleware.js';
import { successResponse } from '../../../shared/helpers/apiResponse.js';
import * as userService from '../services/user.service.js';
import { userIdParamsSchema } from '../validations/userIdParams.validation.js';

export async function getUserController(
    req: Request,
    res: Response
): Promise<void> {
    const { userId } = getValidated(req, 'params', userIdParamsSchema);

    const user = await userService.getUserById(userId);

    res.status(StatusCodes.OK).json(
        successResponse('User retrieved successfully', user)
    );
}
