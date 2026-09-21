const crypto = require("crypto");
const authService = require("../services/authService");
const userModel = require("../models/userModel");
const emailService = require("../services/emailService");
const bcrypt = require("bcrypt");

const home = (req, res) => {
  res.render("landing"); // views/home.ejs
};

const viewLogin = (req, res) => {
  console.log("Locals:", res.locals);
  res.render("login", {
    title: "Login",
  });
};

const viewSignup = (req, res) => {
  res.render("signup", {
    title: "Signup",
  });
};

/**
 * User Registration
 */
const signup = async (req, res, next) => {
  console.log("1. Controller");
  try {
    const user = await authService.registerUser(req.body);
    console.log("7. Back to controller");
    req.session.success = "Account created successfully.";

    return res.redirect("/login");
  } catch (err) {
    if ([400, 409].includes(err.statusCode)) {
      req.session.error = err.message;

      return res.redirect("/signup");
    }

    next(err);
  }
};

const login = async (req, res, next) => {

    try {

        const result =
            await authService.loginUser(req.body);

        const rememberMe =
            req.body.rememberMe === "on";

        res.cookie("token", result.token, {

            httpOnly: true,

            sameSite: "lax",

            secure: false,

            maxAge:
                rememberMe
                    ? 30 * 24 * 60 * 60 * 1000
                    : undefined,

        });


        req.session.success = "Welcome back!";


        switch (result.user.role_name) {

            case "admin":
                return res.redirect("/admin/dashboard");

            case "manager":
                return res.redirect("/manager/dashboard");

            case "employee":
                return res.redirect("/dashboard");

            default:

                req.session.error =
                    "Invalid user role.";

                return res.redirect("/login");

        }


    } catch (err) {

        if ([400, 401, 403].includes(err.statusCode)) {

            req.session.error =
                err.message;

            return res.redirect("/login");

        }

        next(err);

    }

};

/**
 * Logout User
 */
const logout = async (req, res, next) => {
  try {
    // Destroy Session
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      // Clear JWT Cookie
      res.clearCookie("token");

      return res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userModel.findUserByEmail(email);

        // We don't want to reveal if an email exists for security reasons, 
        // so we just return success even if the user isn't found.
        if (!user) {
            return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
        }

        // 1. Generate a random 64-character hex token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // 2. Set expiration to 1 hour from now
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // 3. Save to database
        await userModel.setPasswordResetToken(email, resetToken, expiresAt);

        // 4. Construct the reset link (adjust localhost port if necessary)
        const protocol = req.protocol;
        const host = req.get("host");
        const resetLink = `${protocol}://${host}/auth/reset-password/${resetToken}`;

        // 5. Send the email via Brevo
        await emailService.sendPasswordResetEmail(user.email, user.full_name, resetLink);

        return res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (err) {
        next(err);
    }
};

const renderResetPasswordPage = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await userModel.getUserByValidResetToken(token);

        if (!user) {
            // Token is invalid or expired
            req.session.error = "Password reset token is invalid or has expired.";
            return res.redirect("/login");
        }

        // Render the actual reset password form
        res.render("reset-password", { title: "Reset Password", token });
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // 1. Verify token again
        const user = await userModel.getUserByValidResetToken(token);
        if (!user) {
            return res.status(400).json({ success: false, message: "Token is invalid or expired." });
        }

        // 2. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update password and clear the tokens
        await userModel.clearPasswordResetToken(user.user_id, hashedPassword);

        return res.json({ success: true, message: "Password has been successfully reset. You can now log in." });
    } catch (err) {
        next(err);
    }
};

module.exports = {
  home,
  viewLogin,
  viewSignup,
  forgotPassword,
  renderResetPasswordPage,
  resetPassword,
  signup,
  login,
  logout,
};
