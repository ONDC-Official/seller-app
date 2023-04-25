import path from 'path';
import EmailTemplate from 'email-templates';
import nodemailer from 'nodemailer';
import {mergedEnvironmentConfig} from '../../config/env.config.js';
import emails from './emails';
import {EMAIL_TEMPLATES} from '../utils/constants';

class Mailer {

    constructor(sender) {

        const transport = {
            host: mergedEnvironmentConfig.email.transport.host,
            port: mergedEnvironmentConfig.email.transport.port,
            auth: {
                user: mergedEnvironmentConfig.email.transport.auth.user, // sender's email id
                pass: mergedEnvironmentConfig.email.transport.auth.pass,
            },
        };
        this.sender = sender || mergedEnvironmentConfig.email.sender;
        this.transport = nodemailer.createTransport(transport);
        this.emailTemplate = new EmailTemplate({
            message: {from: this.sender},
            send: true,
            transport: this.transport,
            views: {
                root: path.resolve(__dirname, 'emails'),
                options: {extension: 'pug'},
            },
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    // this is the relative directory to your CSS/image assets
                    relativeTo: path.join(__dirname, '..', '..', 'public', 'stylesheets'),
                },
            },
        });
    }

    /**
     * Get email instance
     * @param {string} type Email type
     * @param {Object} options Options
     * @param {String} [options.sender] email sender
     * @param {Array}  [options.receivers] email receivers array
     * @param {Object} [options.data] email template input data
     * @return {Object} Email instance
     */
    getEmail(type, options = {}) {
        options.sender = options.sender || this.sender;
        options.emailTemplate = this.emailTemplate;
        return new emails[type](options);
    }

    /**
     * Method to send forgot password email
     */
    forgotPassword(options) {
        return this.getEmail(EMAIL_TEMPLATES.FORGOT_PASSWORD, options);
    }


    /**
     * Method to send sign up(wellcome onboard) email
     */
    signUp(options) {
        return this.getEmail(EMAIL_TEMPLATES.SIGN_UP, options);
    }


    /**
     * Method to send invite to student into course email
     */
    invitingStudentEmail(options) {
        return this.getEmail(EMAIL_TEMPLATES.INVITING_STUDENT, options);
    }
    /**
     * Method to resend invite to student into course email
     */
    reInvitingStudentEmail(options) {
        return this.getEmail(EMAIL_TEMPLATES.REINVITING_STUDENT, options);
    }


    /**
     * Method to send sign up(wellcome onboard) email
     */
    exceptionEmail(options) {
        return this.getEmail(EMAIL_TEMPLATES.EXCEPTION, options);
    }

    /**
     * Method to send report
     */
    report(options) {
        return this.getEmail(EMAIL_TEMPLATES.REPORTS, options);
    }
}

export default Mailer;
