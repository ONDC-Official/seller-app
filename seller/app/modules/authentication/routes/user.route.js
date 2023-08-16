
import express from 'express';
const router = express.Router();

import UserController from '../controllers/user.controller';
import AuthenticationController from '../controllers/authentication.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import {authentication,authorisation} from '../../../lib/middlewares';
import userSchema from '../v1/validationSchema/api-params-validation-schema/user.validation.schema';
import {SYSTEM_ROLE} from '../../../lib/utils/constants';
const userController = new UserController();
const authController = new AuthenticationController();
// router.use('/auth', authentication.middleware());

router.post('/v1/users/create',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    userController.create
);

router.post('/v1/users/invite/admin',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    userController.invite
);

router.get('/v1/users/:userId',
    authentication.middleware(),
    userController.getUsersById
);

router.put('/v1/users/:userId/enable',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    userController.enable
);

router.get('/v1/users',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    userController.getUsers
);

router.post('/v1/upload/:category',
    userController.upload
);



module.exports = router;
