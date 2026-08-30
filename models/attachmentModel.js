const query = require("../plugins/query");

const addAttachment = async ({ projectId, taskId = null, uploadedBy, originalName, filePath, fileType, fileSize }) => {
    const sql = `
        INSERT INTO attachments 
        (project_id, task_id, uploaded_by, original_name, file_path, file_type, file_size)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *;
    `;
    const values = [projectId, taskId, uploadedBy, originalName, filePath, fileType, fileSize];
    const { rows } = await query(sql, values);
    return rows[0];
};

const getProjectAttachments = async (projectId) => {
    const sql = `
        SELECT 
            a.*, 
            u.full_name AS uploaded_by_name
        FROM attachments a
        JOIN users u ON a.uploaded_by = u.user_id
        WHERE a.project_id = $1
        ORDER BY a.created_at DESC;
    `;
    const { rows } = await query(sql, [projectId]);
    return rows;
};

const deleteAttachment = async (attachmentId) => {
    const sql = `DELETE FROM attachments WHERE attachment_id = $1 RETURNING *;`;
    const { rows } = await query(sql, [attachmentId]);
    return rows[0];
};
const getAttachmentById = async (attachmentId) => {
    const sql = `SELECT * FROM attachments WHERE attachment_id = $1;`;
    const { rows } = await query(sql, [attachmentId]);
    return rows[0];
};

module.exports = {
    addAttachment,
    getProjectAttachments,
    deleteAttachment,
    getAttachmentById,
};