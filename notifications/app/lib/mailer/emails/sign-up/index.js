import Email from '../../email';
import path from 'path';
import {mergedEnvironmentConfig} from '../../../../config/env.config.js';

class SignUp extends Email {
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
        const { temporaryPassword, user,organization } = this.options.data;
        // Application logo path
        const logo = `${mergedEnvironmentConfig.email.emailHeader}`;
        // Application login page url
        const appLoginUrl = `${mergedEnvironmentConfig.appUrl}`;
        // Support email address
        const supportEmail = mergedEnvironmentConfig.email.supportEmail;
        let name = user.firstName;
        if(user.lastName)
            name = `${user.firstName} ${user.lastName}`;
        return {
            temporaryPassword,
            password:temporaryPassword,
            name: name,
            logo,
            appLoginUrl,
            supportEmail,
            organization
        };
    }
}
module.exports = SignUp;
