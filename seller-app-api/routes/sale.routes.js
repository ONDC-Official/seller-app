import {Router} from 'express';
import CategoryController from '../controllers/category.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const categoryController = new SaleController();

router.get('/category',
    authentication(),
    categoryController.list);

router.get('/category/:id',
    authentication(),
    categoryController.get);

router.post('/category',
    authentication(),
    categoryController.create);

router.put('/category/:id',
    authentication(),
    categoryController.update);

export default router;

//
// request -> routing
//                 /api
//                     -> /category (routing to service -> ())