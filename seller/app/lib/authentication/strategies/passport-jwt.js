import passportJWT from 'passport-jwt';
import { UnauthenticatedError } from '../../errors';
import MESSAGES from '../../utils/messages';
// import { UnauthenticatedError } from '../../errors';
// import MESSAGES from '../../../utils/messages';
// import logger from '../../logger';
import { HEADERS } from '../../utils/constants';
import {mergedEnvironmentConfig} from '../../../config/env.config';
const JwtStrategy = passportJWT.Strategy;

const tokenExtractor = function (req) {
    let token = null;
    let tokenArray = [];

    if (req) {
        token = req.get(HEADERS.ACCESS_TOKEN);

        if (!token) {
            throw new UnauthenticatedError(
                MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
            );
        }

        tokenArray = token.split(' ');
    }

    console.log('token--------->',tokenArray);
    return tokenArray[1];
};

const opts = {
    jwtFromRequest: tokenExtractor, //ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: mergedEnvironmentConfig.jwtSecret,
    passReqToCallback: true,
};

const passportJwtStrategy = new JwtStrategy(
    opts,
    async (req, jwtPayload, done) => {
        try {
            let user = {};


            // if jwt payload contains user obj then its an inter service communication call
            if (jwtPayload.user) {
                user = jwtPayload.user;
                user.userToken = tokenExtractor(req);

                // let cachedToken = myCache.get(`${user.id}-${user.userToken}`); TODO @akshay need to fix that cache token later

                // if(!cachedToken){
                //     throw new UnauthenticatedError(
                //         MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
                //     );
                // }
                if(!user.userToken){ 
                    throw new UnauthenticatedError(
                        MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
                    );
                }

            } else if (jwtPayload.userId) {

                if (!user) {
                    throw new UnauthenticatedError(
                        MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
                    );
                } else if (user.enabled === false) {
                    throw new UnauthenticatedError(
                        MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED
                    );
                }

                user = user.toJSON();
                user.userToken = tokenExtractor(req);

                let cachedToken = myCache.get(`${user.id}-${user.userToken}`);

                if(!cachedToken){
                    throw new UnauthenticatedError(
                        MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
                    );
                }
            }
            return done(null, user);
        } catch (err) {
            // logger.log('error', err);
            return done(err, null);
        }
    }
);

export default passportJwtStrategy;
