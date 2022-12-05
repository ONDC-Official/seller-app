import {Router} from 'express';
import LogisticController from '../controllers/logistic.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const logisticController = new LogisticController();
router.post('/logistics/search-payload-for-retail-select',
    logisticController.search);

router.post('/logistics/init-payload-for-retail-init',
    logisticController.init);

router.post('/logistics/confirm-payload-for-retail-confirm',
    logisticController.confirm);

export default router;
