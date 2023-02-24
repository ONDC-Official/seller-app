import Joi from 'joi';

module.exports = {
    create: () => {
        return Joi.object({
            productCode: Joi.string(),
            productName: Joi.string(),
            MRP: Joi.number(),
            retailPrice: Joi.number(),
            purchasePrice: Joi.number(),
            HSNCode: Joi.string(),
            GST_Percentage: Joi.number(),
            productCategory: Joi.string(),
            productSubcategory1: Joi.string(),
            productSubcategory2: Joi.string(),
            productSubcategory3: Joi.string(),
            quantity: Joi.number(),
            barcode: Joi.number(),
            maxAllowedQty: Joi.number(),
            packQty:Joi.number(),
            UOM: Joi.string(),//units of measure
            length: Joi.number(),
            breadth: Joi.number(),
            height: Joi.number(),
            weight: Joi.number(),
            isReturnable: Joi.boolean(),
            returnWindow: Joi.string(),
            isVegetarian: Joi.boolean(),
            manufacturerName: Joi.string(),
            manufacturedDate: Joi.string(),
            nutritionalInfo: Joi.string(),
            additiveInfo: Joi.string(),
            instructions: Joi.string(),
            isCancellable: Joi.boolean(),
            availableOnCod: Joi.boolean(),
            longDescription: Joi.string(),
            description: Joi.string(),
            images: Joi.array(),
        });
    },
    setStoreDetails:()=>{
        return Joi.object({
            categories: Joi.array(),
            logo: Joi.string(),
            location: {lat:Joi.number(),long:Joi.number()},
            locationAvailabilityPANIndia:Joi.boolean(),
            city:Joi.array(),
            defaultCancellable:Joi.boolean(),
            defaultReturnable:Joi.boolean(),
            supportDetails:{
                email:Joi.string(),
                mobile:Joi.string()
            }
        });
    },
    updateStoreDetails:()=>{
        return Joi.object({
            categories: Joi.array(),
            logo: Joi.string(),
            location: {lat:Joi.number(),long:Joi.number()},
            locationAvailabilityPANIndia:Joi.boolean(),
            city:Joi.array(),
            defaultCancellable:Joi.boolean(),
            defaultReturnable:Joi.boolean(),
            supportDetails:{
            email:Joi.string(),
                mobile:Joi.string()
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
