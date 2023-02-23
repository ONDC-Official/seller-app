
import OrganizationController from '../controllers/organization.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import organisationSchema from '../v1/validationSchema/api-params-validation-schema/organization.validate.schema';
import express from 'express';
import {authentication} from "../../../lib/middlewares";
const router = express.Router();

const organizationController = new OrganizationController();

// router.use('/auth', appVersionValidator.middleware());


/**
 * API to create ORG
 */
router.post('/v1/organizations',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: organisationSchema.create() }),
    organizationController.create);

/**
 * API to get all list
 */
router.get('/v1/organizations',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: organisationSchema.list() }),
    organizationController.list,
);

router.get('/v1/organizations/:organizationId',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: organisationSchema.get() }),
    organizationController.get,
);

module.exports = router;
