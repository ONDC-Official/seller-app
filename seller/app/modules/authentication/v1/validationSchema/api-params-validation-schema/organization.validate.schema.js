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
                fulfillments : Joi.array(),
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
    update: () => {
        return Joi.object({
            user: {
                mobile: Joi.string(),
                name: Joi.string()
            },
            providerDetails: {
                name: Joi.string(),
                address: Joi.string(),
                fulfillments : Joi.array(),
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
    setStoreDetails:()=>{
        return Joi.object({
            categories: Joi.array(),
            category: Joi.string(),
            logo: Joi.string(),
            location: {lat:Joi.number(),long:Joi.number()},
            locationAvailabilityPANIndia:Joi.boolean(),
            city:Joi.array(),
            fulfillments : Joi.array(),
            defaultCancellable:Joi.boolean(),
            defaultReturnable:Joi.boolean(),
            address: {
                building: Joi.string(),
                city: Joi.string(),
                state: Joi.string(),
                country: Joi.string(),
                area_code: Joi.string(),
                locality: Joi.string()
            },
            supportDetails:{
                email:Joi.string(),
                mobile:Joi.string()
            },
            storeTiming:Joi.object(),
            radius:Joi.object(),
            logisticsBppId:Joi.string().allow(''),
            logisticsDeliveryType:Joi.string().allow(''),
            location_availability:Joi.string().allow(''),
            custom_area : Joi.array(),
        });
    },
    updateStoreDetails:()=>{
        return Joi.object({
            categories: Joi.array(),
            logo: Joi.string(),
            fulfillments : Joi.array(),
            location: {lat:Joi.number(),long:Joi.number()},
            locationAvailabilityPANIndia:Joi.boolean(),
            city:Joi.array(),
            defaultCancellable:Joi.boolean(),
            defaultReturnable:Joi.boolean(),
            address: {
                building: Joi.string(),
                city: Joi.string(),
                state: Joi.string(),
                country: Joi.string(),
                area_code: Joi.string(),
                locality: Joi.string()
            },
            supportDetails:{
                email:Joi.string(),
                mobile:Joi.string()
            },
            storeTiming:Joi.object(),
            radius:Joi.object(),
            logisticsBppId:Joi.string().allow(''),
            logisticsDeliveryType:Joi.string().allow(''),
            location_availability:Joi.string().allow(''),
            custom_area : Joi.array(),
        });
    },
    get:()=>{
        return Joi.object({
            organizationId: Joi.string().guid({
                version: ['uuidv4']
            }),
        });
    },

    signup: () => {
        return Joi.object({
            user: {
                email: Joi.string(),
                mobile: Joi.string(),
                name: Joi.string(),
                password:Joi.string()
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
    
    getStoreDetails:()=>{
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
