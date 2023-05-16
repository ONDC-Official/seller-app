import {OndcService} from '../services';

const ondcService = new OndcService();

class OndcController {


    productSearch(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.productSearch(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    orderSelect(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderSelect(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderInit(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderInit(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderConfirm(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderConfirm(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderTrack(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderTrack(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderCancel(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderCancel(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderStatus(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderStatus(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    orderStatusUpdate(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderStatusUpdate(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    orderStatusUpdateItems(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderStatusUpdateItems(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderCancelFromSeller(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderCancelFromSeller(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderUpdate(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderUpdate(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    orderSupport(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        ondcService.orderSupport(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }


}

module.exports = OndcController;
