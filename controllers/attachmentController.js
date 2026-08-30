const attachmentModel = require("../models/attachmentModel");

const uploadProjectFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided or invalid file type." });
        }

        const attachment = await attachmentModel.addAttachment({
            projectId: req.params.projectId,
            taskId: req.body.taskId || null,
            uploadedBy: req.user.user_id,
            originalName: req.file.originalname,
            filePath: `/uploads/projects/${req.file.filename}`,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        return res.status(201).json({ success: true, message: "File uploaded successfully.", attachment });
    } catch (err) {
        next(err);
    }
};

const getProjectFiles = async (req, res, next) => {
    try {
        const files = await attachmentModel.getProjectAttachments(req.params.projectId);
        return res.json({ success: true, files });
    } catch (err) {
        next(err);
    }
};

const deleteProjectFile = async (req, res, next) => {
    try {
        // In a production app, you'd also want to use fs.unlink to delete the actual file from the server
        await attachmentModel.deleteAttachment(req.params.attachmentId);
        return res.json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadProjectFile,
    getProjectFiles,
    deleteProjectFile
};