import path from 'path';
import EmailTemplate from 'email-templates';
import nodemailer from 'nodemailer';
import config from '../config';
import emails from './emails';
import {EMAIL_TEMPLATES} from '../../utils/constants';

class Mailer {

    constructor(sender) {
        this.sender = sender || config.get('email').sender;
        this.transport = nodemailer.createTransport(config.get('email').transport.SMTP);
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
     * Method to send sign up(wellcome onboard) email
     */
    send(options) {
        return this.getEmail(options.template, options);
    }

    /**
     * Method to send OTP
     */
    register(options) {
        return this.getEmail(EMAIL_TEMPLATES.REGISTER, options);
    }

    /**
     * Method to send OTP
     */
    resendOTP(options) {
        return this.getEmail(EMAIL_TEMPLATES.REGISTER, options);
    }

    /**
     * Method to send sign up(wellcome onboard) email
     */
    createPRS(options) {
        return this.getEmail(EMAIL_TEMPLATES.CREATE_PRS, options);
    }

    /**
     * Method to send sign up(wellcome onboard) email
     */
    createPRS(options) {
        return this.getEmail(EMAIL_TEMPLATES.CREATE_PRS, options);
    }
    /**
     * Method to send sign up(wellcome onboard) email
     */
    exceptionEmail(options) {
        return this.getEmail(EMAIL_TEMPLATES.EXCEPTION, options);
    }
}

export default Mailer;
