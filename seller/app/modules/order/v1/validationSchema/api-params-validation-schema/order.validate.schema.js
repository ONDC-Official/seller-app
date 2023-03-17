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
    update: () => {
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
    publish: () => {
        return Joi.object({
            published: Joi.boolean().required(),
        });
    },
    get:()=>{
        return Joi.object({
            productId: Joi.string().guid({
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
