const query = require("../plugins/query");

const addComment = async ({ projectId, taskId = null, userId, content }) => {
    const sql = `
        INSERT INTO comments (project_id, task_id, user_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const { rows } = await query(sql, [projectId, taskId, userId, content]);
    return rows[0];
};

const getProjectComments = async (projectId) => {
    const sql = `
        SELECT 
            c.*, 
            u.full_name,
            p.profile_image
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE c.project_id = $1 AND c.task_id IS NULL
        ORDER BY c.created_at ASC;
    `;
    const { rows } = await query(sql, [projectId]);
    return rows;
};

module.exports = {
    addComment,
    getProjectComments
};