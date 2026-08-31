const query = require("../plugins/query");

const createNotification = async ({
    userId,
    senderId = null,
    type,
    referenceId = null,
    content
}) => {
    const sql = `
        INSERT INTO notifications (
            user_id,
            sender_id,
            type,
            reference_id,
            content
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const { rows } = await query(sql, [
        userId,
        senderId,
        type,
        referenceId,
        content
    ]);

    return rows[0];
};

const getUserNotifications = async (userId, limit = 20) => {
    const sql = `
        SELECT
            n.*,
            u.full_name AS sender_name,
            p.profile_image AS sender_image
        FROM notifications n
        LEFT JOIN users u
            ON n.sender_id = u.user_id
        LEFT JOIN user_profiles p
            ON u.user_id = p.user_id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2;
    `;

    const { rows } = await query(sql, [userId, limit]);

    return rows;
};

const markAsRead = async (notificationId, userId) => {
    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = $1
          AND user_id = $2
        RETURNING *;
    `;

    const { rows } = await query(sql, [
        notificationId,
        userId
    ]);

    return rows[0];
};

const getUnreadCount = async (userId) => {
    const sql = `
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = $1
          AND is_read = FALSE;
    `;

    const { rows } = await query(sql, [userId]);

    return parseInt(rows[0].count, 10);
};

const clearChatNotifications = async (userId, senderId) => {
    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
          AND sender_id = $2
          AND type = 'direct_message'
          AND is_read = FALSE;
    `;

    await query(sql, [userId, senderId]);
};
const markAllAsRead = async (userId) => {

    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
          AND is_read = FALSE;
    `;

    await query(sql, [userId]);
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    getUnreadCount,
    clearChatNotifications,
    markAllAsRead,
};