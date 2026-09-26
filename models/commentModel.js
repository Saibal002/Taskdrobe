const query = require("../plugins/query");
const cacheService = require("../services/cacheService");

const addComment = async ({ projectId, taskId = null, userId, content, replyToId = null }) => {
    const sql = `
        INSERT INTO comments (project_id, task_id, user_id, content, reply_to_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const { rows } = await query(sql, [projectId, taskId, userId, content, replyToId]);

    // Invalidate comment cache for this project/task
    await cacheService.invalidatePrefix("comments:");

    return rows[0];
};

const getProjectComments = async (projectId) => {
    const cacheKey = `comments:project:${projectId}`;

    return await cacheService.getOrSet(cacheKey, 60, async () => {
        const sql = `
            SELECT 
                c.*, 
                u.full_name,
                p.profile_image,
                pc.content AS reply_content,
                pu.full_name AS reply_user_name
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            LEFT JOIN user_profiles p ON u.user_id = p.user_id
            LEFT JOIN comments pc ON c.reply_to_id = pc.comment_id
            LEFT JOIN users pu ON pc.user_id = pu.user_id
            WHERE c.project_id = $1 AND c.task_id IS NULL
            ORDER BY c.created_at ASC;
        `;
        const { rows } = await query(sql, [projectId]);
        return rows;
    });
};

const deleteComment = async (commentId, userId) => {
    const sql = `DELETE FROM comments WHERE comment_id = $1 AND user_id = $2 RETURNING comment_id`;
    const { rows } = await query(sql, [commentId, userId]);

    if (rows[0]) {
        await cacheService.invalidatePrefix("comments:");
    }

    return rows[0];
};

const getTaskComments = async (taskId) => {
    const cacheKey = `comments:task:${taskId}`;

    return await cacheService.getOrSet(cacheKey, 60, async () => {
        const sql = `
            SELECT 
                c.*, 
                u.full_name,
                p.profile_image,
                pc.content AS reply_content,
                pu.full_name AS reply_user_name
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            LEFT JOIN user_profiles p ON u.user_id = p.user_id
            LEFT JOIN comments pc ON c.reply_to_id = pc.comment_id
            LEFT JOIN users pu ON pc.user_id = pu.user_id
            WHERE c.task_id = $1
            ORDER BY c.created_at ASC;
        `;
        const { rows } = await query(sql, [taskId]);
        return rows;
    });
};

module.exports = {
    addComment,
    getProjectComments,
    getTaskComments,
    deleteComment,
};