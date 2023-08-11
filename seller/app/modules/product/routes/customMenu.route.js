
import CustomMenuController from '../controllers/customMenu.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import customMenuSchema from '../v1/validationSchema/api-params-validation-schema/customMenu.validate.schema';
import express from 'express';
import {authentication, authorisation} from '../../../lib/middlewares';
// import {SYSTEM_ROLE} from '../../../lib/utils/constants';
const router = express.Router();
const customMenuController = new CustomMenuController();

router.post('/v1/menu/:category',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: customMenuSchema.createMenu() }),
    customMenuController.createMenu);

router.put('/v1/menu/:menuId',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: customMenuSchema.updateMenu() }),
    customMenuController.updateMenu);

router.delete('/v1/menu/:menuId',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    customMenuController.deleteMenu);

router.get('/v1/menu',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    customMenuController.listMenu);

router.get('/v1/menu/:menuId',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    customMenuController.getMenu);

router.post('/v1/menuOrdering',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    customMenuController.menuOrdering,
);

router.get('/v1/menuProducts/:menuId',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    customMenuController.getMenuProducts);


module.exports = router;
