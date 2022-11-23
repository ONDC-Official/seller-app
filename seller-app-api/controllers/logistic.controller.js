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
        logisticsService.init().then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

    confirm(req, res, next) {
        // const currentUserAccessToken = res.get('currentUserAccessToken');
        logisticsService.confirm().then(data => {
            res.json(data);
        }).catch((err) => {
            next(err);
        });
    }

}

module.exports = LogisticsController;
