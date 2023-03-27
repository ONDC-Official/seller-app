import {Router} from 'express';
import OndcController from '../controllers/ondc.controller';
import { authentication } from '../middlewares/index.js';

const router = new Router();
const ondcController = new OndcController();

router.post('/client/search',
    ondcController.productSearch);

//new changes
router.post('/client/select',
    ondcController.orderSelect);

router.post('/client/Init',
    ondcController.orderInit);

router.post('/client/confirm',
    ondcController.orderConfirm);

router.post('/client/cancel',
    ondcController.orderCancel);

router.post('/client/track',
    ondcController.orderTrack);

router.post('/client/status',
    ondcController.orderStatus);

router.post('/client/status/cancel',
    ondcController.orderCancelFromSeller);

router.put('/client/status/updateOrder',
    ondcController.orderStatusUpdate);

router.put('/client/status/updateOrderItems',
    ondcController.orderStatusUpdateItems);

router.post('/client/update',
    ondcController.orderUpdate);

router.post('/client/support',
    ondcController.orderSupport);

export default router;
