import Joi from 'joi';

module.exports = {
    createMenu: () => {
        return Joi.object({
            name: Joi.string(),
            seq: Joi.number(),
            longDescription: Joi.string(),
            shortDescription: Joi.string(),
            images: Joi.array()
        });
    },
    updateMenu: () => {
        return Joi.object({
            name: Joi.string(),
            seq: Joi.number(),
            longDescription: Joi.string(),
            shortDescription: Joi.string(),
            images: Joi.array(),
            products:Joi.array(),
            timings:Joi.array(),
        });
    },
};
