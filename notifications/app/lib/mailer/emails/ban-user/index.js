import Email from '../../email';
import path from 'path';
// import config from '../../../config';
import {mergedEnvironmentConfig} from '../../../../config/env.config.js';
class ForgotPassword extends Email {
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
        // Application logo path
        const logo = `${mergedEnvironmentConfig.email.emailHeader}`;
        // Application login page url
        const appLoginUrl = `${mergedEnvironmentConfig.appUrl}`;

        // Support email address
        let user = this.options.data.data.user;

        let name = user.name;


        return {
            name: name,
            logo,
            appLoginUrl,
        };
    }
}
module.exports = ForgotPassword;
