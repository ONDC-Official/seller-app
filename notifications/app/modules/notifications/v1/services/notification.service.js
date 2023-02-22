// var FCM = require('fcm-node');
import {mergedEnvironmentConfig} from '../../../../config/env.config.js';
import Mailer from '../../../../lib/mailer';

class NotificationService {


    /**
     * send email notification
     */

    async sendEmailNotification(emailData) {
        // eslint-disable-next-line no-useless-catch
        try {

            const mailer = new Mailer();

            console.log('emaildata==================>',emailData);

            const mail = mailer.getEmail(emailData.template, {
                receivers: emailData.receivers,
                attachment: emailData.attachment,
                data: emailData.data
            });


            mail.send();


            return {};
        } catch (err) {

            throw err;
        }
    }

}

export default NotificationService;
