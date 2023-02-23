import Joi from 'joi';

module.exports = {
    createNotification: () => {
        return Joi.object({
            organizationId: Joi.string().guid({
                version: ['uuidv4']
            }),
            pushTitle : Joi.string(),
            pushText : Joi.string(),
            notificationText : Joi.string(),
            notificationTitle : Joi.string(),
            toUserId : Joi.string().guid({
                version: ['uuidv4']
            }),
            type : Joi.string(),
            metaData : Joi.object(),
            currentUser :Joi.string().guid({
                version: ['uuidv4']
            }),
        });
    },

    getNotifications: () => {
        return Joi.object({
            isRead: Joi.boolean(),
            limit : Joi.number(),
            offset : Joi.number(),
        });
    },
    getNotificationCount: () => {
        return Joi.object({
            //
        });
    },
    markRead: () => {
        return Joi.object({
            //
        });
    },
    deleteNotification: () =>{
        return Joi.object({
            userId: Joi.string().guid({
                version: ['uuidv4']
            }).allow(''),
            organizationId :Joi.string().guid({
                version: ['uuidv4']
            }),
            metaData : Joi.object(),
        });
    }

};
