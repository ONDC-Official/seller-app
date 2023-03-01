
import ProductController from '../controllers/product.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import productSchema from '../v1/validationSchema/api-params-validation-schema/product.validate.schema';
import express from 'express';
import {authentication, authorisation} from "../../../lib/middlewares";
import {SYSTEM_ROLE} from "../../../lib/utils/constants";
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' })

const productController = new ProductController();

router.post('/v1/products',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.create() }),
    productController.create);

router.patch('/v1/products/:productId',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.update() }),
    productController.update);

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

router.get('/v1/products/:productId/ondcGet',
    apiParamsValidator.middleware({ schema: productSchema.get() }),
    productController.get,
);

router.post('/v1/products/upload/bulk',
    authentication.middleware(),
    upload.single("xlsx"),
    productController.uploadCatalog,
);

router.get('/v1/products/upload/bulk/template',
    authentication.middleware(),
    productController.uploadTemplate,
);

module.exports = router;
