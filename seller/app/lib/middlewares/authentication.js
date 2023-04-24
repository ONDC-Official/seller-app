import passport from 'passport';
import { passportJwtStrategy } from '../../lib/authentication';
import { UnauthenticatedError, UnauthorisedError } from '../../lib/errors';
import MESSAGES from '../../lib/utils/messages';

passport.use(passportJwtStrategy);

exports.middleware =
  () =>
      (req, res, next) => {

          console.log('authentication check---');
          passport.authenticate(
              'jwt',
              {
                  session: false,
              },
              (err, user) => {

                  console.log('err---->',err);
                  console.log('user---->',user);
                  if (user) {
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
