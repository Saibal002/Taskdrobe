const query = require("../plugins/query");

const getOrCreateConversation = async (user1Id, user2Id) => {
    // Ensure user1 is always the smaller ID to match our UNIQUE constraint
    const u1 = Math.min(user1Id, user2Id);
    const u2 = Math.max(user1Id, user2Id);

    // Try to find existing conversation
    let sql = `SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2;`;
    let { rows } = await query(sql, [u1, u2]);

    if (rows.length > 0) return rows[0];

    // Create new if it doesn't exist
    sql = `INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *;`;
    const result = await query(sql, [u1, u2]);
    return result.rows[0];
};

const getMessages = async (conversationId, limit = 50) => {
    const sql = `
        SELECT m.*, u.full_name, p.profile_image 
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC
        LIMIT $2;
    `;
    const { rows } = await query(sql, [conversationId, limit]);
    return rows;
};

const saveMessage = async (conversationId, senderId, content) => {
    const sql = `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *;`;
    const { rows } = await query(sql, [conversationId, senderId, content]);
    
    // Bump the last_message_at timestamp for sorting conversations later
    await query(`UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1`, [conversationId]);
    
    return rows[0];
};

// Add this inside models/chatModel.js
const getChatContacts = async (currentUserId) => {
    const sql = `
        SELECT 
            u.user_id, u.full_name, u.email, p.profile_image,
            c.last_message_at,
            CAST((SELECT COUNT(*) FROM messages m 
             WHERE m.conversation_id = c.conversation_id 
             AND m.sender_id = u.user_id 
             AND m.is_read = FALSE) AS INTEGER) AS unread_count,
            (SELECT content FROM messages m 
             WHERE m.conversation_id = c.conversation_id 
             ORDER BY created_at DESC LIMIT 1) as last_msg_content,
            (SELECT sender_id FROM messages m 
             WHERE m.conversation_id = c.conversation_id 
             ORDER BY created_at DESC LIMIT 1) as last_msg_sender_id,
            (SELECT is_read FROM messages m 
             WHERE m.conversation_id = c.conversation_id 
             ORDER BY created_at DESC LIMIT 1) as last_msg_is_read
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        LEFT JOIN conversations c ON 
            (c.user1_id = $1 AND c.user2_id = u.user_id) OR 
            (c.user2_id = $1 AND c.user1_id = u.user_id)
        WHERE u.user_id != $1
        ORDER BY c.last_message_at DESC NULLS LAST, u.full_name ASC;
    `;
    const { rows } = await query(sql, [currentUserId]);
    return rows;
};
const markConversationAsRead = async (conversationId, receiverId) => {
    const sql = `
        UPDATE messages 
        SET is_read = TRUE 
        WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE;
    `;
    await query(sql, [conversationId, receiverId]);
};

// Add to module.exports at the bottom:
// getChatContacts
module.exports = {
    getOrCreateConversation,
    getMessages,
    saveMessage,
    getChatContacts,
    markConversationAsRead,
};