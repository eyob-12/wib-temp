const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        const { id, emails, name } = profile;
        const email = emails[0].value;
        const firstName = name.givenName;
        const lastName = name.familyName;

        let user = await User.findOne({ googleId: id });

        if (!user) {
            user = new User({
                googleId: id,
                email,
                firstName,
                lastName,
                provider: 'google'
            });
            await user.save();
        }

        done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
const FacebookStrategy = require('passport-facebook').Strategy;

// Add this within the existing passport.js file
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
},
    async (accessToken, refreshToken, profile, done) => {
        const { id, emails, name } = profile;
        const email = emails[0].value;
        const firstName = name.givenName;
        const lastName = name.familyName;

        let user = await User.findOne({ facebookId: id });

        if (!user) {
            user = new User({
                facebookId: id,
                email,
                firstName,
                lastName,
                provider: 'facebook'
            });
            await user.save();
        }

        done(null, user);
    }
));


module.exports = passport;
