class Email {
    /**
     * @param {*} template pug email template
     * @param {*} options options passed from child class
     * @param {*} options[emailTemplate] email-templates package instance
     * @param {*} options[receivers] email receiver list
     */
    constructor(template, options) {
        if (!options.emailTemplate) {
            throw new Error('Email template is required');
        }

        if (!options.receivers || !Array.isArray(options.receivers)) {
            throw new Error('Email receivers are required and must be an array');
        }
        // Join array elements as a comma seperated string
        this.receivers = options.receivers.join(', ');
        this.template = template;
        this.options = options;
        this.send = this.send.bind(this);
    }

    send() {
        return new Promise(async (resolve, reject) => {
            const locals = this.getLocals();

            try {
                // Send an email
                const res = await this.options.emailTemplate.send({
                    template: this.template,
                    message: {
                        to: this.receivers
                    },
                    locals: locals
                });
                resolve(res);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    sendWithAttachment() {
        return new Promise(async (resolve, reject) => {
            const locals = this.getLocals();

            try {
                // Send an email
                const res = await this.options.emailTemplate.send({
                    template: this.template,
                    message: {
                        to: this.receivers,
                        attachments:[ {   // binary buffer as an attachment
                            path: this.options.attachment,
                        }]
                    },
                    locals: locals,
                });
                resolve(res);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }
}

export default Email;
