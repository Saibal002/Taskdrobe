const userModel = require("../models/userModel");

/**
 * Render Profile Page
 */
const getProfile = async (req, res, next) => {
    try {
        // Fetch the freshest data, including the joined profile table
        const userProfile = await userModel.findUserById(req.user.user_id);
        
        res.render("profile", {
            title: "My Profile",
            user: userProfile
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Handle Profile Update
 */
const updateProfile = async (req, res, next) => {
    try {
        const { phone, bio } = req.body;
        
        // If multer processed a file, grab the path
        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/profiles/${req.file.filename}`;
        }

        await userModel.upsertUserProfile(req.user.user_id, {
            phone,
            profileImage,
            bio
        });

        req.session.success = "Profile updated successfully.";
        res.redirect(`/${req.user.role_name}/profile`);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProfile,
    updateProfile
};