
import OrganizationController from '../controllers/organization.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import organisationSchema from '../v1/validationSchema/api-params-validation-schema/organization.validate.schema';
import express from 'express';
const router = express.Router();

const organizationController = new OrganizationController();

// router.use('/auth', appVersionValidator.middleware());


/**
 * API to create ORG
 */
router.post('/v1/organizations',
    apiParamsValidator.middleware({ schema: organisationSchema.create() }),
    organizationController.create);

/**
 * API to get all list
 */
router.get('/v1/iam/organizations',
    apiParamsValidator.middleware({ schema: organisationSchema.list() }),
    organizationController.list,
);

router.get('/v1/iam/organization/:organizationId',
    apiParamsValidator.middleware({ schema: organisationSchema.get() }),
    organizationController.get,
);

module.exports = router;
