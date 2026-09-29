const attachmentModel = require("../models/attachmentModel");
const taskModel = require("../models/taskModel");
const ActivityService = require("../services/activityService"); // INJECTED LOGGER
const { createClient } = require('@supabase/supabase-js');
const path = require("path");

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = 'task-attachments'; // Make sure this bucket is set to "Public" in Supabase

// Helper function to upload buffer to Supabase
const uploadToSupabase = async (file, folderPath) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    const storagePath = `${folderPath}/${uniqueSuffix}-${cleanName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

    return publicUrlData.publicUrl;
};

const uploadProjectFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided or invalid file type." });
        }

        const projectId = req.params.projectId;
        const fileUrl = await uploadToSupabase(req.file, `projects/${projectId}`);

        const attachment = await attachmentModel.addAttachment({
            projectId: projectId,
            taskId: req.body.taskId || null,
            uploadedBy: req.user.user_id,
            originalName: req.file.originalname,
            filePath: fileUrl, // Store Supabase public URL
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        // Log the upload
        ActivityService.log({
            userId: req.user.user_id,
            action: "CREATE",
            entityType: "File",
            entityId: attachment.attachment_id || projectId,
            description: `Uploaded project file: ${req.file.originalname}`
        }).catch(err => console.error(err));

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
        // 1. Find the file in the database
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

        // 3. Delete from Supabase Storage
        const fullUrl = attachment.file_path;
        const urlParts = fullUrl.split(`/${BUCKET_NAME}/`);
        if (urlParts.length === 2) {
            const storagePath = urlParts[1];
            await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        }

        // 4. Delete from PostgreSQL Database
        await attachmentModel.deleteAttachment(req.params.attachmentId);

        // Log the deletion
        ActivityService.log({
            userId: req.user.user_id,
            action: "DELETE",
            entityType: "File",
            entityId: req.params.attachmentId,
            description: `Deleted file: ${attachment.original_name}`
        }).catch(err => console.error(err));

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

        const taskId = req.params.taskId;
        const task = await taskModel.getTaskById(taskId);
        if (!task) return res.status(404).json({ success: false, message: "Task not found." });

        const fileUrl = await uploadToSupabase(req.file, `tasks/${taskId}`);

        const attachment = await attachmentModel.addAttachment({
            projectId: task.project_id,
            taskId: taskId,
            uploadedBy: req.user.user_id,
            originalName: req.file.originalname,
            filePath: fileUrl, // Store Supabase public URL
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        // Log the task file upload
        ActivityService.log({
            userId: req.user.user_id,
            action: "CREATE",
            entityType: "File",
            entityId: attachment.attachment_id || taskId,
            description: `Uploaded file to task: ${req.file.originalname}`
        }).catch(err => console.error(err));

        // Format required by task-insight.ejs AJAX response
        return res.status(201).json({ 
            success: true, 
            attachment: {
                ...attachment,
                uploaded_by_name: req.user.full_name
            }
        });
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