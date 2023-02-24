
import ProductController from '../controllers/product.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import productSchema from '../v1/validationSchema/api-params-validation-schema/product.validate.schema';
import express from 'express';
import {authentication, authorisation} from "../../../lib/middlewares";
import {SYSTEM_ROLE} from "../../../lib/utils/constants";
const router = express.Router();

const productController = new ProductController();

router.post('/v1/products',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.create() }),
    productController.create);

router.get('/v1/products',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.list() }),
    productController.list,
);

router.get('/v1/products/search',
    productController.search,
);

router.get('/v1/products/:productId',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: productSchema.get() }),
    productController.get,
);

module.exports = router;
