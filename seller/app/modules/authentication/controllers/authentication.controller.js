import AuthenticationService  from '../v1/services/authentication.service';

const authenticationService = new AuthenticationService();

class AuthenticationController {
    /**
   * Login
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   **/
    login(req, res, next) {
        const data = req.body;
        authenticationService
            .login(req.user, data)
            .then(({ user, token }) => {
                res.json({ data: { user, access_token: token } });
            })
            .catch((err) => {
                next(err);
            });
    }

    /**
   * Forgot Password
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   **/
    forgotPassword(req, res, next) {
        const data = req.body;
        //    console.log("generated opt req.body "+data)
        authenticationService
            .forgotPassword(data)
            .then((result) => {
                res.json({ data: result });
            })
            .catch((err) => {
                next(err);
            });
    }

    /**
   * Forgot Password
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   **/
    updatePassword(req, res, next) {
        const data = req.body;
        authenticationService.updatePassword(data)
            .then((result) => {
                res.json({ data: result });
            })
            .catch((err) => {
                next(err);
            });
    }


    /**
     * Reset Password
     *
     * Used when the user logs in with the OTP
     *
     * @param {*} req    HTTP request object
     * @param {*} res    HTTP response object
     * @param {*} next   Callback argument to the middleware function
     * @return {callback}
     **/
    async resetPassword(req, res, next) {
        try {
            const data = req.body;
            const { user: currentUser } = req;
            authenticationService
                .resetPassword(currentUser, data)
                .then((result) => {
                    res.json({ data: result });
                })
                .catch((err) => {
                    next(err);
                });
        } catch (error) {
            console.log('[ProjectController] [getUploadUrl] Error -', error);
            next(error);
        }
    }


    /**
   * Set Password
   *
   * Force change password for org admins
   * Set password for user themselves
   *
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   **/
    setPassword(req, res, next) {
        const data = req.body;
        const user = req.user;
        authenticationService
            .setPassword(data, user)
            .then((result) => {
                res.json({ data: result });
            })
            .catch((err) => {
                next(err);
            });
    }

}

export default AuthenticationController;
