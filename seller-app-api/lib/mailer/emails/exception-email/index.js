import Email from '../../email';
import path from 'path';
import config from '../../../config';

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
        const {err} = this.options.data;
        const exceptionOccuredAt = new Date();
        const appLoginUrl = `${config.get('email').webClientUri}/signin`;
        // Application logo path
        const logo = `https://spiritpedia-static-files.s3.us-east-2.amazonaws.com/79611622703456631.png`;
        return {
            err,
            stackTrace: err.stack,
            appLoginUrl,
            exceptionOccuredAt,
            logo
        };
    }
}

module.exports = ExceptionEmail;
