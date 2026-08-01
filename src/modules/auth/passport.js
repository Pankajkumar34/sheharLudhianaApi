const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../user/user.model");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // console.log("Profile:", profile);

                const email = profile.emails[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        fullName: profile.displayName,
                        email,
                        profileImage: profile.photos[0]?.value,
                        socialLogin: {
                            provider: "google",
                            socialId: profile.id,
                        },
                        isEmailVerified: true,
                        role: "USER",
                    });
                }

                // console.log("User before done:", user);

                return done(null, user);

            } catch (err) {
                console.log(err);
                return done(err);
            }
        }
    )
);