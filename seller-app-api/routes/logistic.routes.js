import {Router} from 'express';
import LogisticController from '../controllers/logistic.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const logisticController = new LogisticController();
router.post('/logistics/search',
    logisticController.search);

router.post('/logistics/init',
    logisticController.init);

router.post('/logistics/confirm',
    logisticController.confirm);

export default router;
