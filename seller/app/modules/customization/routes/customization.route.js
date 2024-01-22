import CustomizationController from '../controllers/customizationController';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import customizationSchema from '../v1/validationSchema/customization.validate.schema'
import express from 'express';
import {authentication, authorisation} from '../../../lib/middlewares';
import {SYSTEM_ROLE} from '../../../lib/utils/constants';
const router = express.Router();

const customizationController = new CustomizationController();

router.post('/v1/customizationGroup', 
    authentication.middleware(), 
    apiParamsValidator.middleware({ schema: customizationSchema.create() }), 
    customizationController.storeCustomizationsGroup);

router.get('/v1/customizationGroup/:groupId',
    authentication.middleware(),
    customizationController.getCustomizationGroupById);

router.delete('/v1/customizationGroup/:groupId', 
    authentication.middleware(), 
    customizationController.deleteCustomizationGroup);

router.get('/v1/customizationGroups', 
    authentication.middleware(), 
    customizationController.getCustomizationsGroup);

router.put('/v1/customizationGroup/:groupId', 
    authentication.middleware(), 
    apiParamsValidator.middleware({ schema: customizationSchema.update() }), 
    customizationController.updateCustomizationsGroup);

module.exports = router;
