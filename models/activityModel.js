const db = require("../plugins/db");

const ActivityModel = {
    /**
     * Create a new activity record.
     */
    async create({
        userId,
        action,
        entityType,
        entityId = null,
        description
    }) {
        const query = `
            INSERT INTO activities
                (user_id, action, entity_type, entity_id, description)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING
                activity_id,
                user_id,
                action,
                entity_type,
                entity_id,
                description,
                created_at
        `;

        const values = [
            userId,
            action,
            entityType,
            entityId,
            description
        ];

        const result = await db.query(query, values);

        return result.rows[0];
    },

    /**
     * Get the most recent activities with Role data.
     */
    async getRecent(limit = 10) {
        const query = `
            SELECT
                a.activity_id,
                a.user_id,
                u.full_name AS user_name,
                u.profile_image,
                r.role_name, 
                a.action,
                a.entity_type,
                a.entity_id,
                a.description,
                a.created_at
            FROM activities a
            INNER JOIN users u ON u.user_id = a.user_id
            INNER JOIN roles r ON u.role_id = r.role_id 
            ORDER BY a.created_at DESC
            LIMIT $1
        `;

        const result = await db.query(query, [limit]);

        return result.rows;
    }
};

module.exports = ActivityModel;