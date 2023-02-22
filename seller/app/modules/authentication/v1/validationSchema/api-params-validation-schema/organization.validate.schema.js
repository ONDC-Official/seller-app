import Joi from 'joi';

module.exports = {
    create: () => {
        return Joi.object({
            name: Joi.string().trim().required(),
            profilePic:Joi.string(),

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
