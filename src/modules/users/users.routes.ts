import { Router } from 'express';
import { validationMiddleware } from '../../middlewares/validationMiddleware.js';
import { createUserController } from './controllers/createUser.controller.js';
import { deleteUserController } from './controllers/deleteUser.controller.js';
import { getUserController } from './controllers/getUser.controller.js';
import { getUsersController } from './controllers/getUsers.controller.js';
import { updateUserController } from './controllers/updateUser.controller.js';
import { createUserBodySchema } from './validations/createUser.validation.js';
import { getUsersQuerySchema } from './validations/getUsers.validation.js';
import { updateUserBodySchema } from './validations/updateUser.validation.js';
import { userIdParamsSchema } from './validations/userIdParams.validation.js';

//* Express 5 forwards errors thrown by async handlers to the error handler,
//* so controllers need no try/catch.
const router = Router();

router.post(
    '/',
    validationMiddleware({ body: createUserBodySchema }),
    createUserController
);

router.get(
    '/',
    validationMiddleware({ query: getUsersQuerySchema }),
    getUsersController
);

router.get(
    '/:userId',
    validationMiddleware({ params: userIdParamsSchema }),
    getUserController
);

router.patch(
    '/:userId',
    validationMiddleware({
        params: userIdParamsSchema,
        body: updateUserBodySchema,
    }),
    updateUserController
);

router.delete(
    '/:userId',
    validationMiddleware({ params: userIdParamsSchema }),
    deleteUserController
);

export default router;
