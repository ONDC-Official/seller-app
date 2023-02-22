const NodeMailer = require('nodemailer');
const Handlebars = require('handlebars');
const emailTemplates = require('../../config/emailTemplates/index');
// const commonHelper = require('../../lib/utils/commonHelper.util');
import {mergedEnvironmentConfig} from '../../config/env.config.js';

const sendNotificationEmail = async ({templateName, bindingParams}) => {
    // bindingParams = commonHelper.removeFalsyProperties(bindingParams);
    // if (!bindingParams) return;

    bindingParams.now = new Date();

    // configure transporter
    const transporter = NodeMailer.createTransport({
        host: mergedEnvironmentConfig.email.transport.host,
        port: mergedEnvironmentConfig.email.transport.port,
        auth: {
            user: mergedEnvironmentConfig.email.transport.auth.user, // sender's email id
            pass: mergedEnvironmentConfig.email.transport.auth.pass,
        },
    });

    const mailOptions = {
        from: bindingParams.emailSender ?? mergedEnvironmentConfig.email.sender,
        to: bindingParams.emailRecipients,
        cc: bindingParams.emailCcRecipients,
        bcc: bindingParams.emailBccRecipients,
        subject: Handlebars.compile(emailTemplates[templateName].SUBJECT)(bindingParams),
        text: Handlebars.compile(emailTemplates[templateName].BODY)(bindingParams),
    };

    // send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(`Message ${info.messageId} sent: ${info.response}`);
    });
};

module.exports = {
    sendNotificationEmail
};
