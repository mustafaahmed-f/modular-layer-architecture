import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getValidated } from '../../../middlewares/validationMiddleware.js';
import { successResponse } from '../../../shared/helpers/apiResponse.js';
import * as userService from '../services/user.service.js';
import { getUsersQuerySchema } from '../validations/getUsers.validation.js';

export async function getUsersController(
    req: Request,
    res: Response
): Promise<void> {
    const query = getValidated(req, 'query', getUsersQuerySchema);

    const { items, pagination } = await userService.getUsers(query);

    res.status(StatusCodes.OK).json(
        successResponse('Users retrieved successfully', items, { pagination })
    );
}
