import passport from 'passport';
import { passportJwtStrategy } from '../../lib/authentication';
import { UnauthenticatedError, UnauthorisedError } from '../../lib/errors';
import MESSAGES from '../../lib/utils/messages';
var httpContext = require('express-http-context');

passport.use(passportJwtStrategy);

exports.middleware =
    ({ ensureSameOrg } = {}) =>
        (req, res, next) => {
            // ensureSameOrg ensures either the admin is a superuser (i.e.
            // organizationId) is null or else, the value at key provided by
            // `ensureSameOrg` is same as organizationId of the user
            passport.authenticate('jwt',{session: false,},(err, user) => {
                if (user) {
                    if (ensureSameOrg) {
                        if (user.organizationId !== null && user.organizationId !== ensureSameOrg(req)){
                            throw new UnauthorisedError(MESSAGES.USER_NOT_ALLOWED);
                        }
                    }
                    // httpContext.ns.bindEmitter( req );
                    // httpContext.ns.bindEmitter( res );
                    // httpContext.ns.set('request.req.user.token',user.currentUserToken);
                    // httpContext.ns.set('request.req.user.id',user.id);
                    req.user = user;
                    next();
                } else if (err) {
                    next(err);
                } else {
                    next(
                        new UnauthenticatedError(
                            MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
                        )
                    );
                }
            }
            )(req, res, next);
        };
