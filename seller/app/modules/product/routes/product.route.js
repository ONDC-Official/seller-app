
import ProductController from '../controllers/product.controller';
import apiParamsValidator from '../v1/middleware/api.params.validator';
import productSchema from '../v1/validationSchema/api-params-validation-schema/product.validate.schema';
import express from 'express';
import {authentication, authorisation} from '../../../lib/middlewares';
import {SYSTEM_ROLE} from '../../../lib/utils/constants';
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const productController = new ProductController();

router.post('/v1/products',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.create() }),
    productController.create);

router.post('/v1/productWithVariant',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.createWithVariant() }),
    productController.createWithVariants);

router.put('/v1/products/:productId',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.update() }),
    productController.update);

router.put('/v1/productWithVariant',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.updateWithVariant() }),
    productController.updateWithVariants);

router.put('/v1/products/:productId/publish',
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.publish() }),
    productController.publish);

router.get('/v1/products',
    authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    apiParamsValidator.middleware({ schema: productSchema.list() }),
    productController.list,
);

router.get('/v1/products/search',
    productController.search,
);

router.get('/v1/products/search/increamentalPull/:category',
    productController.searchIncrementalPull,
);

router.get('/v1/products/:productId',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: productSchema.get() }),
    productController.get,
);

router.get('/v1/productWithVariant/:productId',
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: productSchema.get() }),
    productController.getWithVariants,
);

router.get('/v1/products/:productId/ondcGet',
    apiParamsValidator.middleware({ schema: productSchema.get() }),
    productController.ondcGet,
);

router.get('/v1/products/:productId/ondcGetForUpdate',
    apiParamsValidator.middleware({ schema: productSchema.get() }),
    productController.ondcGetForUpdate,
);

router.post('/v1/products/upload/bulk',
    authentication.middleware(),
    upload.single('xlsx'),
    productController.uploadCatalog,
);

router.get('/v1/products/upload/bulk/template',
    //authentication.middleware(),
    productController.uploadTemplate,
);

router.get('/v1/product/categorySubcategoryAttributes',
    //authentication.middleware(),
    productController.categorySubcategoryAttributeList,
);
router.get('/v1/product/categorySubcategories',
    //authentication.middleware(),
    productController.categorySubcategoryList,
);
router.get('/v1/product/categories',
    //authentication.middleware(),
    productController.categoryList,
);

// router.get('/v1/product/:productId/customizations',
//     authentication.middleware(),
//     productController.getCustomizations,
// );

// router.post('/v1/product/:productId/customizations',
//     authentication.middleware(),
//     apiParamsValidator.middleware({ schema: productSchema.createCustomization() }),
//     productController.storeCustomizations,
// );

router.post('/v1/product/customization',//TODO:Tirth - add joi validation(Done)
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: productSchema.createCust() }),
    productController.createCustomization
);
//TODO:TIRTH
router.get('/v1/product/customizations',
    authentication.middleware(),
    productController.getCustomization
);

router.put('/v1/product/customization/:customizationId',//TODO:TIRTH - add id
    authentication.middleware(),
    apiParamsValidator.middleware({ schema: productSchema.updateCust() }),
    productController.updateCustomization
);

router.delete('/v1/product/customization/:customizationId',
    authentication.middleware(),
    productController.deleteCustomization
);

router.get('/v1/product/customization/:customizationId',
    authentication.middleware(),
    productController.getCustomizationById
);

module.exports = router;
