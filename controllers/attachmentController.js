const attachmentModel = require("../models/attachmentModel");
const taskModel = require("../models/taskModel");

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
        // 1. Find the file
        const attachment = await attachmentModel.getAttachmentById(req.params.attachmentId);
        
        if (!attachment) {
            return res.status(404).json({ success: false, message: "File not found." });
        }

        // 2. Enforce Ownership for Employees
        if (req.user.role_name === 'employee') {
            if (String(attachment.uploaded_by) !== String(req.user.user_id)) {
                return res.status(403).json({ success: false, message: "You can only delete files that you uploaded." });
            }
        }

        // 3. Delete the file
        await attachmentModel.deleteAttachment(req.params.attachmentId);
        return res.json({ success: true, message: "File deleted successfully." });
    } catch (err) {
        next(err);
    }
};

const uploadTaskFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided." });
        }

        // We need the project ID to satisfy the attachments table constraint
        const task = await taskModel.getTaskById(req.params.taskId);
        if (!task) return res.status(404).json({ success: false, message: "Task not found." });

        const attachment = await attachmentModel.addAttachment({
            projectId: task.project_id,
            taskId: req.params.taskId,
            uploadedBy: req.user.user_id,
            originalName: req.file.originalname,
            filePath: `/uploads/projects/${req.file.filename}`, // Resuing the project upload folder
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        return res.status(201).json({ success: true, attachment });
    } catch (err) {
        next(err);
    }
};
module.exports = {
    uploadProjectFile,
    getProjectFiles,
    deleteProjectFile,
    uploadTaskFile,
};