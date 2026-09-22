const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const passport = require("passport");
const { generateToken } = require("../utils/jwt"); // Adjust path if necessary

const validate = require("../validators/validate");

const {
    signupSchema,
    loginSchema,
} = require("../validators/authValidator");

router.post(
    "/signup",
    validate(signupSchema),
    authController.signup
);

router.post(
    "/login",
    validate(loginSchema),
    authController.login
);
router.get(
    "/profile",
    authMiddleware,
    (req, res) => {

        res.json({
            success: true,
            user: req.user,
        });

    }
);

// Trigger Google Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// Google Callback
router.get("/google/callback", 
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        const token = generateToken({
            userId: req.user.user_id,
            roleId: req.user.role_id,
            role: req.user.role_name,
        });

        res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false });
        req.session.success = "Welcome back via Google!";

        const routes = { admin: "/admin/dashboard", manager: "/manager/dashboard", employee: "/dashboard" };
        return res.redirect(routes[req.user.role_name] || "/login");
    }
);

// Forgot & Reset Password Flows
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.renderResetPasswordPage);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/logout", authController.logout);
module.exports = router;