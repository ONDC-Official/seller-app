import express from 'express';
const router = express.Router();
import AuthenticationController from '../controllers/authentication.controller';
import {authentication} from '../../../lib/middlewares';
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

module.exports = router;
