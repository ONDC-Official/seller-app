
import OrderController from '../controllers/order.controller';
import express from 'express';
import {authentication, authorisation} from "../../../lib/middlewares";
import {SYSTEM_ROLE} from "../../../lib/utils/constants";
const router = express.Router();

const orderController = new OrderController();

router.post('/v1/orders',
    orderController.create);

router.get('/v1/orders',
    authentication.middleware(),
    //authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.list,
);

router.get('/v1/orders/:orderId',
    orderController.get,
);

router.post('/v1/orders/:orderId/status', //Accepted only
    authentication.middleware(),
    authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.updateOrderStatus,
);

router.get('/v1/orders/:orderId/ondcGet',
    orderController.getONDC,
);

router.put('/v1/orders/:orderId/ondcUpdate',
    orderController.ondcUpdate,
);

module.exports = router;
