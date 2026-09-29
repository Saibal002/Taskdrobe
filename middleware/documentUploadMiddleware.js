const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

// Switch to Memory Storage (keeps file buffer in RAM to upload directly to Supabase)
const storage = multer.memoryStorage();

// File Type Filter for Documents & Images
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedExts = /jpeg|jpg|png|webp|pdf|doc|docx|xls|xlsx|csv|txt/;
    
    // Allowed MIME types
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/csv', 'text/plain'
    ];

    const isExtValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);

    if (isExtValid && isMimeValid) {
        cb(null, true);
    } else {
        cb(new AppError("Invalid file type. Allowed: Images, PDF, Word, Excel, CSV, TXT.", 400), false);
    }
};

// Initialize Multer (15MB limit for project files)
const uploadProjectDocument = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: fileFilter
});

module.exports = {
    uploadProjectDocument
};