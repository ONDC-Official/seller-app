import {Router} from 'express';
import LogisticController from '../controllers/logistic.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const logisticController = new LogisticController();
router.post('/logistics/search-payload-for-retail-select',
    logisticController.search);

//new changes
router.post('/client/select',
    logisticController.productSelect);

router.post('/logistics/init-payload-for-retail-init',
    logisticController.init);

router.post('/client/Init',
    logisticController.productInit);

router.post('/logistics/confirm-payload-for-retail-confirm',
    logisticController.confirm);

router.post('/client/confirm',
    logisticController.productConfirm);

router.post('/logistics/cancel-payload-for-retail-cancel',
    logisticController.cancel);


router.post('/client/cancel',
    logisticController.productCancel);

router.post('/client/track',
    logisticController.productTrack);

router.post('/logistics/track-payload-for-retail-track',
    logisticController.track);

router.post('/client/track',
    logisticController.productStatus);

router.post('/logistics/status-payload-for-retail-status',
    logisticController.status);

router.post('/client/support',
    logisticController.productSupport);

router.post('/logistics/support-payload-for-retail-support',
    logisticController.support);

export default router;
