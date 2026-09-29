const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client (Reusing your existing public bucket)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = 'task-attachments'; 

/**
 * Render Profile Page
 */
const getProfile = async (req, res, next) => {
    try {
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
 * Handle Profile Update (Supabase Integration)
 */
const updateProfile = async (req, res, next) => {
    try {
        const { phone, bio } = req.body;
        let profileImage = null;

        // If a new file was uploaded, push to Supabase
        if (req.file) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const storagePath = `profiles/${req.user.user_id}/${uniqueSuffix}-${cleanName}`;

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(storagePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error("Supabase Avatar Upload Error:", error);
                throw new Error("Failed to upload avatar to storage.");
            }

            // Retrieve the public URL
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(storagePath);

            profileImage = publicUrlData.publicUrl;
        }

        // Upsert the profile with the new Supabase URL (or null to keep existing)
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

        if (!currentPassword || !newPassword || !confirmPassword) {
            console.log("❌ [Profile] Validation Failed: Missing required fields.");
            return res.status(400).json({ success: false, message: "All password fields are required." });
        }

        const user = await userModel.findUserByEmail(req.user.email);
        if (!user) {
            console.log("❌ [Profile] User not found in database.");
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        console.log("🔍 [Profile] Verifying current password match...");
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            console.log("❌ [Profile] Current password incorrect.");
            return res.status(401).json({ success: false, message: "Incorrect current password. Please try again." });
        }
        console.log("✅ [Profile] Current password verified.");

        if (newPassword !== confirmPassword) {
            console.log("❌ [Profile] Validation Failed: New passwords do not match.");
            return res.status(400).json({ success: false, message: "Your new passwords do not match." });
        }

        if (newPassword.length < 8) {
            console.log("❌ [Profile] Validation Failed: Password too short.");
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
        }

        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            console.log("❌ [Profile] Validation Failed: New password matches old password.");
            return res.status(400).json({ success: false, message: "New password must be different from your current one." });
        }

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

/**
 * Handle Profile Image Deletion
 */
const deleteAvatar = async (req, res, next) => {
    try {
        const userProfile = await userModel.findUserById(req.user.user_id);
        
        if (!userProfile || !userProfile.profile_image) {
            return res.status(400).json({ success: false, message: "No profile picture to delete." });
        }

        // 1. Extract path and delete from Supabase Storage
        const fullUrl = userProfile.profile_image;
        const urlParts = fullUrl.split(`/${BUCKET_NAME}/`);
        
        if (urlParts.length === 2) {
            const storagePath = urlParts[1];
            await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        }

        // 2. Clear the database record
        await userModel.removeProfileImage(req.user.user_id);

        return res.json({ success: true, message: "Profile picture removed successfully." });
    } catch (err) {
        console.error("Avatar Deletion Error:", err);
        return res.status(500).json({ success: false, message: "Error removing profile picture." });
    }
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    deleteAvatar
};