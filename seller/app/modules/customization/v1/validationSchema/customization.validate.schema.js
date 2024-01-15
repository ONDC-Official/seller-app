import Joi from 'joi';
module.exports = {
    create: () => {
        return Joi.object({
            name: Joi.string(),
            inputType: Joi.string(),
            minQuantity: Joi.number(),
            maxQuantity: Joi.number(),
            description:Joi.string().allow(''),
            seq: Joi.number(),
            customizations: Joi.array().items(
                Joi.object({
                    customizationId: Joi.string(),
                    nextGroupId: Joi.array().items(
                        Joi.object({
                            groupId: Joi.string()
                        })
                    ),
                    default: Joi.boolean()
                })
            )
        });
    },
    update: () => {
        return Joi.object({
            name: Joi.string(),
            inputType: Joi.string(),
            description:Joi.string().allow(''),
            minQuantity: Joi.number(),
            maxQuantity: Joi.number(),
            seq: Joi.number(),
            customizations: Joi.array().items(
                Joi.object({
                    customizationId: Joi.string(),
                    nextGroupId: Joi.array().items(
                        Joi.object({
                            groupId: Joi.string()
                        })
                    ),
                    default: Joi.boolean()
                })
            )
        });
    }
};
