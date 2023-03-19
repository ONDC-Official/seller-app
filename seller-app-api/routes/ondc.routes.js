import {Router} from 'express';
import LogisticController from '../controllers/ondc.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const logisticController = new LogisticController();

router.post('/client/search',
    logisticController.productSearch);

//new changes
router.post('/client/select',
    logisticController.orderSelect);

router.post('/client/Init',
    logisticController.orderInit);

router.post('/client/confirm',
    logisticController.orderConfirm);

router.post('/client/cancel',
    logisticController.orderCancel);

router.post('/client/track',
    logisticController.orderTrack);

router.post('/client/status',
    logisticController.orderStatus);

router.post('/client/status/cancel',
    logisticController.orderCancelFromSeller);

router.put('/client/status/updateOrder',
    logisticController.orderStatusUpdate);

router.post('/client/update',
    logisticController.orderUpdate);

router.post('/client/support',
    logisticController.orderSupport);

export default router;
