import passportJWT from 'passport-jwt';
import { UnauthenticatedError } from '../../errors';
import MESSAGES from '../../utils/messages';
import {mergedEnvironmentConfig} from '../../../config/env.config';
const JwtStrategy = passportJWT.Strategy;
import { HEADERS } from '../../utils/constants';
var httpContext = require('express-http-context');
let currentUserToken = '';
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
    currentUserToken =tokenArray[1];
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
            } else if (jwtPayload.userId) {
                //TODO: add db level auth check

                // user = await User.findOne({
                //   where: {
                //     id: jwtPayload.userId
                //   },
                //   include: [{ model: UserOrganization, include: [{ model: Role }] }]
                // });

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
            }
            // httpContext.set('request.req.user.token',currentUserToken);
            // httpContext.set('request.req.user.id',user.id);
            user.currentUserToken = currentUserToken;
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
);

export default passportJwtStrategy;
