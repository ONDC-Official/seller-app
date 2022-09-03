import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

const passportEmailLocalStrategy = new LocalStrategy(async (email, password, done) => {
    try {
        // const user = await User.findOne({
        //     where: {
        //         emailAddress: emailAddress.toLowerCase()
        //     }
        // });
        //
        // if (!user) {
        //     return done(null, false);
        // }
        //
        // const isPasswordValid = await user.authenticate(password);
        //
        // if (!isPasswordValid) {
        //     return done(null, false);
        // }
        return done(null, {});
    } catch (err) {
        return done(err, false);
    }
});

export default passportEmailLocalStrategy;
