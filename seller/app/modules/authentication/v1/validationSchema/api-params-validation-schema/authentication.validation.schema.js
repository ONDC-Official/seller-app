import Joi from 'joi';

module.exports = {
    login: () => {
        return Joi.object({
            email: Joi.string(),
            mobile: Joi.string(),
            password: Joi.string()
        });

    },
    forgotPassword: () => {
        return Joi.object({
            email: Joi.string().trim().required()
        });

    },
    changePassword: () => {

        return Joi.object({
            password: Joi.string().required(),
        });

    },

    activate: () => {

        return Joi.object({
            username:Joi.string().trim().required(),
            password:Joi.string().required(),
            deviceType: Joi.string(),
            deviceToken:Joi.string(),
            apnToken:Joi.string(),
        });

    },

    setPassword: () => Joi.object({
        id: Joi.string().required(),
        password: Joi.string().required(),
    }),
};
