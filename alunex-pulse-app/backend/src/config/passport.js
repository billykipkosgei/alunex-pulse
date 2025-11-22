const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');

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
                    const email = profile.emails[0].value;

                    // Check if user already exists (either invited or previously registered)
                    let user = await User.findOne({ email });

                    if (user) {
                        // EXISTING USER (Invited or previously registered)
                        // Update their OAuth provider info if they're logging in with Google
                        if (!user.providerId || user.authProvider !== 'google') {
                            user.providerId = profile.id;
                            user.authProvider = 'google';
                            user.avatar = user.avatar || profile.photos?.[0]?.value || '';
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // NEW USER - Create organization and make them admin
                    const orgName = `${profile.displayName}'s Workspace`;
                    const organization = await Organization.create({
                        name: orgName,
                        owner: null // Will be updated after user creation
                    });

                    // Create new user as admin of their own organization
                    user = await User.create({
                        name: profile.displayName,
                        email: email,
                        authProvider: 'google',
                        providerId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                        organization: organization._id,
                        role: 'admin',
                        isActive: true
                    });

                    // Update organization owner
                    await Organization.findByIdAndUpdate(organization._id, {
                        owner: user._id
                    });

                    done(null, user);
                } catch (error) {
                    console.error('Google OAuth error:', error);
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
                    const email = profile.emails[0].value;

                    // Check if user already exists (either invited or previously registered)
                    let user = await User.findOne({ email });

                    if (user) {
                        // EXISTING USER (Invited or previously registered)
                        // Update their OAuth provider info if they're logging in with Microsoft
                        if (!user.providerId || user.authProvider !== 'microsoft') {
                            user.providerId = profile.id;
                            user.authProvider = 'microsoft';
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // NEW USER - Create organization and make them admin
                    const orgName = `${profile.displayName}'s Workspace`;
                    const organization = await Organization.create({
                        name: orgName,
                        owner: null // Will be updated after user creation
                    });

                    // Create new user as admin of their own organization
                    user = await User.create({
                        name: profile.displayName,
                        email: email,
                        authProvider: 'microsoft',
                        providerId: profile.id,
                        organization: organization._id,
                        role: 'admin',
                        isActive: true
                    });

                    // Update organization owner
                    await Organization.findByIdAndUpdate(organization._id, {
                        owner: user._id
                    });

                    done(null, user);
                } catch (error) {
                    console.error('Microsoft OAuth error:', error);
                    done(error, null);
                }
            }
        )
    );
}

module.exports = passport;
