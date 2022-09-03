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

    async send() 
    {
       
        const locals = this.getLocals();
        try 
        {
            // Send an email
            const res = await this.options.emailTemplate.send({
                template: this.template,
                message: {
                    to: this.receivers
                },
                locals: locals
            });
            return res
        } catch (err) 
        {
            console.error(err);
            throw err
        }
       
    }

    async sendWithAttachment() 
    {
        
        const locals = this.getLocals();

        try 
        {
            // Send an email

            console.log("in send email with attachment",this.options)
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
            return res
        } 
        catch (err) 
        {
            console.error(err);
            throw err
        }
       
    }
}

export default Email;
