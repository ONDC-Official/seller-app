import AuthenticationService  from '../v1/services/authentication.service';
import {HEADERS} from '../../../lib/utils/constants';
import HttpRequest from '../../../lib/utils/HttpRequest';
import {mergedEnvironmentConfig} from '../../../config/env.config';
import axios from 'axios';
import UserService from '../v1/services/user.service';

const authenticationService = new AuthenticationService();
const userService =new UserService();
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

    logout(req, res, next) {
        let user = req.user;
        let token = req.userToken;

        console.log('req---->',req.user);

        myCache.del(`${req.user.id}-${req.user.userToken}`);

        //console.log(myCache.get(`${req.user.id}-${JWTToken}`));
        //global.sessionMap.push[{userId:currentUser._id,token:JWTToken}];
        res.json({});
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

    async mmiToken(req, res, next) {
        try {

            let params = {
                'grant_type': 'client_credentials',
                'client_id': mergedEnvironmentConfig.mmi.id,
                'client_secret': mergedEnvironmentConfig.mmi.secret            };

            var paramsData  = new URLSearchParams();
            paramsData.append('grant_type', params.grant_type);
            paramsData.append('client_id', params.client_id);
            paramsData.append('client_secret', params.client_secret);

            let headers = {'Content-Type': 'application/x-www-form-urlencoded'};

            let result=  await axios.post('https://outpost.mapmyindia.com/api/security/oauth/token', paramsData,{headers});

            res.send(result.data);

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

    grantAccess(req, res) {
        let {id:userId} = req.params;
        userService.grantAccess(userId).then((token) => {
            res.json({});
        }).catch((err) => {
            next(err);
        });
    }

}

export default AuthenticationController;
