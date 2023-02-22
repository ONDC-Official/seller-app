
// Controllerparams
import express from 'express';
import {authentication} from '../../../lib/middlewares';
import apiParamsValidator from '../../../lib/middlewares/api.params.validator';
import notificationValidation  from './../v1/validationSchema/api-params-validation-schema/notifcation.validation.schema';
const router = express.Router();
import NotificationController from '../controllers/notification.controller';
const notificationController = new NotificationController();
/**
 * Send email notification
 */
router.post('/v1/nes/email', notificationController.sendEmailNotification); 


module.exports = router;
