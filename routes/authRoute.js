const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

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
module.exports = router;