import Joi from 'joi';

module.exports = {
    create: () => {
        return Joi.object({
            commonDetails: Joi.object({
                productCode: Joi.string(),
                productName: Joi.string(),
                HSNCode: Joi.string(),
                GST_Percentage: Joi.number(),
                productCategory: Joi.string(),
                productSubcategory1: Joi.string(),
                productSubcategory2: Joi.string(),
                productSubcategory3: Joi.string(),
                maxAllowedQty: Joi.number(),
                packQty:Joi.any(),
                UOM: Joi.string(),//units of measure
                length: Joi.any(),
                breadth: Joi.any(),
                height: Joi.any(),
                weight: Joi.any(),
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
                manufacturerOrPackerName:Joi.string(),
                manufacturerOrPackerAddress:Joi.string(),
                commonOrGenericNameOfCommodity:Joi.string(),
                monthYearOfManufacturePackingImport:Joi.string(),
                importerFSSAILicenseNo:Joi.string(),
                brandOwnerFSSAILicenseNo:Joi.string(),
                varientAttributes: Joi.object(),
                quantity: Joi.number(),
                MRP: Joi.number(),
                retailPrice: Joi.number(),
                purchasePrice: Joi.number(),
                barcode: Joi.number(),
                images: Joi.array(),
            }),
            commonAttributesValues: Joi.object(),
            customizationDetails: Joi.object({
                customizationGroups: Joi.array(),
                customizations: Joi.array(),
            }),
        });
    },
    createWithVariant: () => {
        return Joi.object({
            commonDetails: Joi.object({
                productCode: Joi.string(),
                productName: Joi.string(),
                HSNCode: Joi.string(),
                GST_Percentage: Joi.number(),
                productCategory: Joi.string(),
                productSubcategory1: Joi.string(),
                productSubcategory2: Joi.string(),
                productSubcategory3: Joi.string(),
                maxAllowedQty: Joi.number(),
                packQty:Joi.any(),
                UOM: Joi.string(),//units of measure
                length: Joi.any(),
                breadth: Joi.any(),
                height: Joi.any(),
                weight: Joi.any(),
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
                manufacturerOrPackerName:Joi.string(),
                manufacturerOrPackerAddress:Joi.string(),
                commonOrGenericNameOfCommodity:Joi.string(),
                monthYearOfManufacturePackingImport:Joi.string(),
                importerFSSAILicenseNo:Joi.string(),
                brandOwnerFSSAILicenseNo:Joi.string()
            }),
            commonAttributesValues: Joi.object(),
            variantSpecificDetails: Joi.array().items(
                Joi.object({
                    varientAttributes: Joi.object(),
                    UOMValue : Joi.string(),
                    quantity: Joi.number(),
                    MRP: Joi.number(),
                    retailPrice: Joi.number(),
                    purchasePrice: Joi.number(),
                    barcode: Joi.number(),
                    images: Joi.array(),
                })
            ),
            variationOn: Joi.string(),
            variantType: Joi.array().items(
                Joi.string()
            )
        });
    },
    update: () => {
        return Joi.object({
            commonDetails: Joi.object({
                productCode: Joi.string(),
                productName: Joi.string(),
                HSNCode: Joi.string(),
                GST_Percentage: Joi.number(),
                productCategory: Joi.string(),
                productSubcategory1: Joi.string(),
                productSubcategory2: Joi.string(),
                productSubcategory3: Joi.string(),
                maxAllowedQty: Joi.number(),
                packQty:Joi.any(),
                UOM: Joi.string(),//units of measure
                length: Joi.any(),
                breadth: Joi.any(),
                height: Joi.any(),
                weight: Joi.any(),
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
                manufacturerOrPackerName:Joi.string(),
                manufacturerOrPackerAddress:Joi.string(),
                commonOrGenericNameOfCommodity:Joi.string(),
                monthYearOfManufacturePackingImport:Joi.string(),
                importerFSSAILicenseNo:Joi.string(),
                brandOwnerFSSAILicenseNo:Joi.string(),
                varientAttributes: Joi.object(),
                quantity: Joi.number(),
                MRP: Joi.number(),
                retailPrice: Joi.number(),
                purchasePrice: Joi.number(),
                barcode: Joi.number(),
                images: Joi.array(),
            }),
            commonAttributesValues: Joi.object(),
            customizationDetails: Joi.object({
                customizationGroups: Joi.array(),
                customizations: Joi.array(),
            }),
        });
    },
    updateWithVariant: () => {
        return Joi.object({
            commonDetails: Joi.object({
                productCode: Joi.string(),
                productName: Joi.string(),
                HSNCode: Joi.string(),
                GST_Percentage: Joi.number(),
                productCategory: Joi.string(),
                productSubcategory1: Joi.string(),
                productSubcategory2: Joi.string(),
                productSubcategory3: Joi.string(),
                maxAllowedQty: Joi.number(),
                packQty:Joi.any(),
                UOM: Joi.string(),//units of measure
                length: Joi.any(),
                breadth: Joi.any(),
                height: Joi.any(),
                weight: Joi.any(),
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
                manufacturerOrPackerName:Joi.string(),
                manufacturerOrPackerAddress:Joi.string(),
                commonOrGenericNameOfCommodity:Joi.string(),
                monthYearOfManufacturePackingImport:Joi.string(),
                importerFSSAILicenseNo:Joi.string(),
                brandOwnerFSSAILicenseNo:Joi.string()
            }),
            commonAttributesValues: Joi.object(),
            variantSpecificDetails: Joi.array().items(
                Joi.object({
                    varientAttributes: Joi.object(),
                    _id:Joi.string(),
                    quantity: Joi.number(),
                    MRP: Joi.number(),
                    retailPrice: Joi.number(),
                    purchasePrice: Joi.number(),
                    barcode: Joi.number(),
                    images: Joi.array(),
                }),
            ),
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
