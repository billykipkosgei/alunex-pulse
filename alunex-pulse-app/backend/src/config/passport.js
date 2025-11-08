const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User.model');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({
                        $or: [
                            { providerId: profile.id, authProvider: 'google' },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Update existing user's provider info if needed
                        if (!user.providerId || user.authProvider !== 'google') {
                            user.providerId = profile.id;
                            user.authProvider = 'google';
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        authProvider: 'google',
                        providerId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                        isActive: true
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
}

// Microsoft OAuth Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(
        new MicrosoftStrategy(
            {
                clientID: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                callbackURL: process.env.MICROSOFT_CALLBACK_URL || '/api/auth/microsoft/callback',
                tenant: 'consumers', // Use 'consumers' for personal Microsoft accounts
                scope: ['user.read']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({
                        $or: [
                            { providerId: profile.id, authProvider: 'microsoft' },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // Update existing user's provider info if needed
                        if (!user.providerId || user.authProvider !== 'microsoft') {
                            user.providerId = profile.id;
                            user.authProvider = 'microsoft';
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        authProvider: 'microsoft',
                        providerId: profile.id,
                        isActive: true
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
}

module.exports = passport;
