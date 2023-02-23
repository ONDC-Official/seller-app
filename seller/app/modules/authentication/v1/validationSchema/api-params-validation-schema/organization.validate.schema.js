import Joi from 'joi';

module.exports = {
    create: () => {
        return Joi.object({
            user: {
                email: Joi.string(),
                mobile: Joi.string(),
                name: Joi.string()
            },
            providerDetails: {
                name: Joi.string(),
                address: Joi.string(),
                contactEmail: Joi.string(),
                contactMobile: Joi.string(),
                addressProof: Joi.string(),
                idProof: Joi.string(),
                bankDetails: {
                    accHolderName: Joi.string(),
                    accNumber: Joi.string(),
                    IFSC: Joi.string(),
                    cancelledCheque: Joi.string(),
                    bankName: Joi.string(),
                    branchName: Joi.string()
                },
                PAN: {PAN: Joi.string(), proof: Joi.string()},
                GSTN: {GSTN: Joi.string(), proof: Joi.string()},
                FSSAI: Joi.string()
            }
        });
    },
    get:()=>{
        return Joi.object({
            organizationId: Joi.string().guid({
                version: ['uuidv4']
            }),
        });
    },
    list:()=>{
        return Joi.object({
            name:Joi.string().empty(''),
            offset:Joi.number(),
            limit:Joi.number()
        });
    }
};
