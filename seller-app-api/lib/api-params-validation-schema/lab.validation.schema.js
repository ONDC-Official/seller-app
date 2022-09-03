import Joi from '@hapi/joi';

module.exports = {
    create: () => {
        return Joi.object({
            fullName: Joi.string().required(),
            shortName: Joi.string().required(),
        });
    },

    update: () => {
        return Joi.object({
            fullName: Joi.string().required(),
            shortName: Joi.string().required(),
        });

    }



};