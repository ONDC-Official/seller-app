import {Router} from 'express';
import ProductController from '../controllers/product.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const productController = new ProductController();
router.get('/product',
    productController.list);

router.get('/product/:id',
    productController.get);

router.post('/product',
    authentication(),
    productController.create);

router.put('/product/:id',
    authentication(),
    productController.update);

router.get('/orders',
    productController.orderList);


router.get('/orders/:id',
    productController.getOrderById);


//ONDC specific API

router.post('/search',
    productController.search);

router.post('/select',
    productController.select);

router.post('/init',
    productController.init);

router.post('/confirm',
    productController.confirm);

router.get('/order',
    productController.orderList);



export default router;
