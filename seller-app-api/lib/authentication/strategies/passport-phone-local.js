import passportLocal from 'passport-local';
// import {User} from '../../../models';

const LocalStrategy = passportLocal.Strategy;

const passportPhoneLocalStrategy = new LocalStrategy(async (phone, password, done) => {
    try {

        return done(null, {});
    } catch (err) {
        return done(err, false);
    }
});

export default passportPhoneLocalStrategy;
