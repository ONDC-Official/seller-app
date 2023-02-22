import config from '../lib/config';

exports.middleware = () => (req, res, next) => {
    if (req.get('appVersion')) {
        const systemVersion = config
            .get('system-setting')
            .minAllowedAppVersion.split('.');
        const appVersion = req.get('appVersion').split('.');
        let version = 0;
        let system = 0;
        let multiplier = 100;
        let systemMultiplier = 100;
        for (let i = 0; i < appVersion.length; i++) {
            version += appVersion[i] * multiplier;
            multiplier = multiplier / 10;
        }

        for (let i = 0; i < systemVersion.length; i++) {
            system += systemVersion[i] * systemMultiplier;
            systemMultiplier = systemMultiplier / 10;
        }

        if (system <= version) {
            next();
        } else {
            res.status(426).send();
        }
    } else {
        next();
    }
};
