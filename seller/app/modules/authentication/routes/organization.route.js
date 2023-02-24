
import OrganizationController from '../controllers/organization.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import organisationSchema from '../v1/validationSchema/api-params-validation-schema/organization.validate.schema';
import express from 'express';
import {authentication, authorisation} from "../../../lib/middlewares";
import {SYSTEM_ROLE} from "../../../lib/utils/constants";
const router = express.Router();

const organizationController = new OrganizationController();

router.post('/v1/organizations',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    apiParamsValidator.middleware({ schema: organisationSchema.create() }),
    organizationController.create);

router.patch('/v1/organizations/:id/storeDetails',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: organisationSchema.setStoreDetails() }),
    organizationController.setStoreDetails);

router.get('/v1/organizations/:organizationId/storeDetails',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: organisationSchema.getStoreDetails() }),
    organizationController.getStoreDetails);

router.get('/v1/organizations',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.SUPER_ADMIN]}),
    apiParamsValidator.middleware({ schema: organisationSchema.list() }),
    organizationController.list,
);

router.get('/v1/organizations/:organizationId',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: organisationSchema.get() }),
    organizationController.get,
);

module.exports = router;
