const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/AppError");

// Ensure the upload directory exists
const projectUploadPath = path.join(__dirname, "../public/uploads/projects");
if (!fs.existsSync(projectUploadPath)) {
    fs.mkdirSync(projectUploadPath, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, projectUploadPath);
    },
    filename: function (req, file, cb) {
        // Format: proj-[project_id]-[timestamp]-[random].ext
        const projectId = req.params.projectId || req.body.projectId || 'general';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        
        cb(null, `proj-${projectId}-${uniqueSuffix}${ext}`);
    }
});

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