import Joi from '@hapi/joi';

module.exports = {
    create: () => {
        return Joi.object({
            name: Joi.string().required(),
            drugType: Joi.string().required(),
        });
    },

    update: () => {
        return Joi.object({
            name: Joi.string().required(),
            drugType: Joi.string().required(),
        });

    }



};