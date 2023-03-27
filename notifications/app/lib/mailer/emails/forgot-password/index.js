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
        let { temporaryPassword, user,resetPasswordLink,password } = this.options.data;
        // Application logo path
        const logo = `${mergedEnvironmentConfig.email.emailHeader}`;
        // Application login page url
        const appLoginUrl = `${mergedEnvironmentConfig.appUrl}`;
        const appUrl = `${mergedEnvironmentConfig.appUrl}`;

        resetPasswordLink = appUrl+'/'+resetPasswordLink;
        // Support email address
        const supportEmail = mergedEnvironmentConfig.email.supportEmail;

        let name = user.firstName;
        if(user.lastName)
            name = `${user.firstName} ${user.lastName}`;

        const playStoreUrl = 'https://www.wemotiveforge.com';
        const appleStoreUrl = 'https://www.wemotiveforge.com';

        const playstore = `${mergedEnvironmentConfig.email.playstore}`;
        const appleStore = 'https://edu-static-files.s3.us-east-2.amazonaws.com/playstore+(2).png';

        return {
            temporaryPassword,
            playStoreUrl,
            appleStoreUrl,
            playstore,
            appleStore,
            name: name,
            password,
            logo,
            appLoginUrl,
            supportEmail,
            resetPasswordLink
        };
    }
}
module.exports = ForgotPassword;
