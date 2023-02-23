import Email from '../../email';
import path from 'path';
import {mergedEnvironmentConfig} from '../../../../config/env.config.js';

class ExceptionEmail extends Email {
    /**
   * @constructor
   * @param {Object} options Options
   */
    constructor(options) {
        super(path.basename(__dirname), options);
        this.options = options;
        this.getLocals = this.getLocals.bind(this);
    }

    getLocals() {
        const { err, req } = this.options.data;
        const exceptionOccuredAt = new Date();

        // Application logo path
        const logo = `${mergedEnvironmentConfig.emailHeader}`;
        return {
            err,
            stackTrace: err.stack,
            exceptionOccuredAt,
            logo,
            method: req.method,
            path: req.originalUrl,
            body: JSON.stringify(req.body, null, 2),
            hostname: req.hostname,
        };
    }
}

module.exports = ExceptionEmail;
