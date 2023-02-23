import Joi from 'joi';
import { GENDERS } from '../../../../../lib/utils/constants';

module.exports = {
    create: () => {
        return Joi.object({
            organizationId: Joi.string().guid({
                version: ['uuidv4']
            }),
            firstName: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            mobile: Joi.string().trim().required()
        });
    },

    getUser: () => {
        return Joi.object({
            userId: Joi.string().guid({
                version: ['uuidv4']
            }),
        });

    },
    getUsers: () => {
        return Joi.object({
            organizationId: Joi.string().guid({
                version: ['uuidv4']
            }),
            firstName:Joi.string().empty(''),
            email:Joi.string().empty(''),
            mobile:Joi.string().empty(''),
            offset:Joi.number(),
            limit:Joi.number()
        });

    },

    update: () => {
        return Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string(),
            middleName: Joi.string(),
            gender: Joi.string().valid(...Object.values(GENDERS)),
            dob: Joi.string(),
            profilePic:Joi.string(),
        });

    },
    usersById: () => {
        return Joi.object({
            userIds:Joi.array()
        });

    },
};
