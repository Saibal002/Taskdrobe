const multer = require("multer");
const AppError = require("../utils/AppError");
const path = require("path");

// Use memory storage for Supabase
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|webp/;
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const isExtValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);

    if (isExtValid && isMimeValid) {
        cb(null, true);
    } else {
        cb(new AppError("Invalid file type. Only JPEG, PNG, and WebP are allowed.", 400), false);
    }
};

const uploadProfileImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
}).single('profileImage'); // Ensure you add .single() to parse the form data!

module.exports = {
    uploadProfileImage
};