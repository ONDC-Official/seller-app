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

}

module.exports = LogisticsController;
