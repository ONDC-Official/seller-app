import {LogisticsService} from '../services';

const logisticsService = new LogisticsService();

class LogisticsController {


    search(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.search(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    productSelect(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productSelect(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    productInit(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productInit(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    productConfirm(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productConfirm(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    productTrack(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productTrack(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    productCancel(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productCancel(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    productStatus(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productStatus(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    productSupport(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.productSupport(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    init(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.init(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    confirm(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.confirm(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    track(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.track(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    support(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.support(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    status(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.status(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }
    cancel(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.cancel(req.body,req).then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

}

module.exports = LogisticsController;
