const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadProfileImage } = require("../middleware/uploadMiddleware");

// Middleware to ensure the URL role matches the logged-in user's role
const verifyProfileRoleUrl = (req, res, next) => {
    const urlRole = req.params.role;
    const actualRole = req.user.role_name;

    if (urlRole !== actualRole) {
        // Automatically correct the URL and redirect them to their actual profile
        return res.redirect(`/${actualRole}/profile`);
    }
    next();
};

router.get(
    "/:role/profile", 
    authMiddleware, 
    verifyProfileRoleUrl, 
    profileController.getProfile
);

router.post(
    "/:role/profile/update", 
    authMiddleware, 
    verifyProfileRoleUrl, 
    uploadProfileImage, 
    profileController.updateProfile
);
router.post(
    "/:role/profile/change-password", 
    authMiddleware, 
    verifyProfileRoleUrl, 
    profileController.changePassword
);
module.exports = router;