import Joi from '@hapi/joi';

module.exports = {
    create: () => {
        return Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            emailAddress: Joi.string().required(),
            role: Joi.string().required(),
            password:Joi.string().required(),
        });
    },

    update: () => {
        return Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            emailAddress: Joi.string().required(),
            role: Joi.string().required(),
            password:Joi.string().allow(null),
        });

    },

    resendInvitation: () => {
        return Joi.object({
            id: Joi.string()
        });

    },

    emailUpdate: () => {
        return Joi.object({
            emailAddress: Joi.string()
        });

    },

    enableDisable: () => {  
        return Joi.object({
            enabled: Joi.boolean()
        });

    },

    aboutMe: () => {
        return Joi.object({
            name: Joi.string(),
            shortBio:Joi.string().empty('').default(''),
            drinkTime: Joi.string(),
            drinkType: Joi.array(),
            label: Joi.array(),
            singleMalt: Joi.string(),
            profileImageURL:Joi.string().allow(null),
            coverImageURL: Joi.string().allow(null),

        });
    },

    myFeed: () => {
        return Joi.object({
            suggest: Joi.array(),
            brand: Joi.array(),
            vendor: Joi.array()
        });

    },

    address: () => {
        return Joi.object({
            name: Joi.string(),
            type: Joi.string().empty('').default(''),
            address: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string()

        });

    }



};