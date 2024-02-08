
import OrderController from '../controllers/order.controller';
import express from 'express';
import {authentication, authorisation} from '../../../lib/middlewares';
import {SYSTEM_ROLE} from '../../../lib/utils/constants';
const router = express.Router();

const orderController = new OrderController();

router.post('/v1/orders',
    orderController.create);

router.get('/v1/orders',
    authentication.middleware(),
    //authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.list,
);
router.get('/v1/orders/return/request',
    authentication.middleware(),
    //authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.listReturnRequests,
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

router.post('/v1/orders/:orderId/cancel',
    // authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.cancel,
);
router.post('/v1/orders/:orderId/cancelOrder',
    // authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.cancelOrder,
);

router.post('/v1/orders/:orderId/item/cancel',
    // authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.cancelItems,
);

router.post('/v1/orders/:orderId/item/return',
    // authentication.middleware(),
    // authorisation.middleware({roles: [SYSTEM_ROLE.ORG_ADMN]}),
    orderController.updateReturnItem,
);

module.exports = router;
