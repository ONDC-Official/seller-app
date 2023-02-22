
import express from 'express';
const router = express.Router();

import UserController from '../controllers/user.controller';
import AuthenticationController from '../controllers/authentication.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import {authentication} from '../../../lib/middlewares';
import userSchema from '../v1/validationSchema/api-params-validation-schema/user.validation.schema';

const userController = new UserController();
const authController = new AuthenticationController();
// router.use('/auth', authentication.middleware());

router.post('/v1/users/create',
    userController.create
);

router.get('/v1/users/:userId',
    userController.getUsersById
);

router.get('/v1/users',
    userController.getUsers
);

router.get('/v1/upload/:category',
    userController.upload
);



module.exports = router;
