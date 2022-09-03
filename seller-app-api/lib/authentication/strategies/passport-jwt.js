import passportJWT from 'passport-jwt';
import config from '../../../lib/config';
import {UnauthenticatedError} from '../../errors';
import MESSAGES from '../../../utils/messages';

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;


const tokenExtractor = function (req) {

    let token = null;
    let tokenArray = []

    if (req) {
        token = req.get('access-token');
        if(!token)
        {
            token = req.get('authorization');
            if(token)
            {
                tokenArray = token.split(" ");
            }
        }
        else
        {
            tokenArray = token.split(" ");
        }

    }

    console.log("tokenArray[1]---------------------",tokenArray[1])
    return tokenArray[1];
};

const opts = {
    jwtFromRequest: tokenExtractor, //ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('auth').token.access.secret,
    passReqToCallback: true
};


const passportJwtStrategy = new JwtStrategy(opts, async (req, jwtPayload, done) => {
    try {

        // let user = await User.findOne({
        //     where: {
        //         id: jwtPayload.userId
        //     }
        // });
        //
        // if (!user) {
        //     return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID), null);
        // } else if (user.enabled === false) {
        //     return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED), null);
        // } else {
        //
        //     const userLoginTimestamp = new Date().getTime();
        //     // user.lastActiveAt =new Date();
        //     await User.update({lastActiveAt :userLoginTimestamp},{where:{id:jwtPayload.userId}});

            return done(null, {});
        // }

    } catch (err) {

        return done(err, null);
    }
});

export default passportJwtStrategy;
