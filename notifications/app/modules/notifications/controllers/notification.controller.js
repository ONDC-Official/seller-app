import NotificationService from '../../notifications/v1/services/notification.service';

const notificationService = new NotificationService();

class NotificationController {
    /**
     * Send email notification
     * @param {*} req    HTTP request object
     * @param {*} res    HTTP response object
     * @param {*} next   Callback argument to the middleware function
     * @return {callback}
     */
    sendEmailNotification(req, res, next) {
        const currentUserAccessToken = res.get('currentUserAccessToken');
        const data = req.body;
        notificationService
            .sendEmailNotification({ ...data, currentUser: req.user }, currentUserAccessToken)
            .then((user) => {
                res.json({ data: user });
            })
            .catch((err) => {
                next(err);
            });
    }
}
export default NotificationController;
