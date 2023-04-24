import express from 'express';
const router = express.Router();
import AuthenticationController from '../controllers/authentication.controller';
import {authentication, authorisation} from '../../../lib/middlewares';
import {SYSTEM_ROLE} from '../../../lib/utils/constants';
// import { authSchema } from '../lib/api-params-validation-schema';

const authenticationController = new AuthenticationController();

// router.use('/auth', appVersionValidator.middleware());

/**
 * API to login using mobile and PIN
 */
router.post(
    '/v1/auth/login',
    authenticationController.login
);

router.post(
    '/v1/auth/logout',
    authentication.middleware(),
    authenticationController.logout
);

/**
 * API to generate 6 digit PIN
 */
router.post(
    '/v1/auth/forgotPassword',
    authenticationController.forgotPassword
);

router.post(
    '/v1/auth/updatePassword',
    authenticationController.updatePassword
);

/**
 * API to reset existing PIN
 */
router.post(
    '/v1/auth/resetPassword',
    authentication.middleware(),
    authenticationController.resetPassword
);


router.post(
    '/v1/auth/mmi/token',
    authenticationController.mmiToken
);

router.put('/v1/auth/grantAccess/:id', authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    authenticationController.grantAccess);


module.exports = router;
