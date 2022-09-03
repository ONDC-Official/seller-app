import Joi from '@hapi/joi';

module.exports = {
    login: () => {

        return Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
            deviceManufacturer: Joi.string().empty('').default(''),
            deviceModel: Joi.string().empty('').default(''),
            OSVersion: Joi.string().empty('').default(''),
            deviceName: Joi.string().empty('').default(''),
            appVersion: Joi.string().empty('').default(''),
            deviceType: Joi.string().empty('').default(''),
            deviceToken: Joi.string().empty('').default(''),
            browserVersion: Joi.string().empty('').default('')
        });

    },
    loginWithMobile: () => {

        return Joi.object({
            countryCode:Joi.string(),
        });

    },
    verifyOtp: () => {
        return Joi.object({
            countryCode:Joi.string(),
            otp: Joi.string().required(),
            deviceManufacturer: Joi.string().empty('').default(''),
            deviceModel: Joi.string().empty('').default(''),
            OSVersion: Joi.string().empty('').default(''),
            deviceName: Joi.string().empty('').default(''),
            appVersion: Joi.string().empty('').default(''),
            deviceType: Joi.string().empty('').default(''),
            deviceToken: Joi.string().empty('').default('')
        });

    },
    forgotPassword: () => {
        return Joi.object({
            emailAddress: Joi.string().required(),
        });

    },
    resendInvitation: () => {
        return Joi.object({
            id: Joi.string().required(),
        });

    },
    resetPassword: () => {
        return Joi.object({
            password: Joi.string().required(),
        });

    },
    changePassword: () => {

        return Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().required()
        });

    },
    signup: () => {
        return Joi.object({
            name: Joi.string().required(),
            emailAddress: Joi.string().required(),
            countryCode:Joi.string(),
            role: Joi.string()
        });
    },
};