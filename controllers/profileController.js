const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
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

/**
 * Handle Password Change
 */
const changePassword = async (req, res, next) => {
    console.log(`\n🔒 [Profile] Initiating password change for: ${req.user.email}`);
    
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // 1. Check for missing fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            console.log("❌ [Profile] Validation Failed: Missing required fields.");
            return res.status(400).json({ success: false, message: "All password fields are required." });
        }

        // 2. Fetch the user's current hashed password
        const user = await userModel.findUserByEmail(req.user.email);
        if (!user) {
            console.log("❌ [Profile] User not found in database.");
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        // 3. PRIORITY CHECK: Verify current password FIRST
        console.log("🔍 [Profile] Verifying current password match...");
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            console.log("❌ [Profile] Current password incorrect.");
            return res.status(401).json({ success: false, message: "Incorrect current password. Please try again." });
        }
        console.log("✅ [Profile] Current password verified.");

        // 4. Check if new passwords match
        if (newPassword !== confirmPassword) {
            console.log("❌ [Profile] Validation Failed: New passwords do not match.");
            return res.status(400).json({ success: false, message: "Your new passwords do not match." });
        }

        // 5. Check minimum length
        if (newPassword.length < 8) {
            console.log("❌ [Profile] Validation Failed: Password too short.");
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
        }

        // 6. Check if the new password is the same as the old one
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            console.log("❌ [Profile] Validation Failed: New password matches old password.");
            return res.status(400).json({ success: false, message: "New password must be different from your current one." });
        }

        // 7. Hash new password and update database
        console.log("🔐 [Profile] Hashing new password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.updatePassword(req.user.user_id, hashedPassword);
        console.log(`✅ [Profile] Password successfully updated for ${req.user.email}\n`);

        return res.json({ success: true, message: "Password has been successfully updated!" });

    } catch (err) {
        console.error("🔥 [Profile] Error changing password:", err);
        return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword // <-- Don't forget to export it!
};

