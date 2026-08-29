const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

// Ensure the upload directory exists
const profileUploadPath = path.join(__dirname, "../public/uploads/profiles");
if (!fs.existsSync(profileUploadPath)) {
    fs.mkdirSync(profileUploadPath, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profileUploadPath);
    },
    filename: function (req, file, cb) {
        // Example: user-1-16987654321.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Use user ID if available, otherwise generic prefix
        const prefix = req.user ? `user-${req.user.user_id}` : 'profile';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

// File Type Filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new AppError("Only image files (jpeg, jpg, png, webp) are allowed.", 400), false);
    }
};

// Initialize Multer
const uploadProfileImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
}).single("profileImage"); // Expecting an input named "profileImage"

module.exports = {
    uploadProfileImage
};