const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel"); // Ensure this exists to fetch role_id by name

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await userModel.findUserByEmail(email);

        if (!user) {
            // Auto-register new Google users as 'employee'
            const role = await roleModel.findRoleByName("employee");
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await userModel.createUser({
                roleId: role.role_id,
                fullName: profile.displayName,
                email: email,
                password: hashedPassword,
                profileImage: profile.photos[0].value
            });
            // Fetch the fully joined user object to get role_name for the JWT
            user = await userModel.findUserByEmail(email); 
        }

        if (!user.is_active) return done(null, false, { message: "Account deactivated." });
        
        await userModel.updateLastLogin(user.user_id);
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
  }
));

module.exports = passport;