const query = require("../plugins/query");

class NoteModel {
    /**
     * Create a new note
     */
    static async createNote({ userId, title, description, body, isPublic }) {
        const sql = `
            INSERT INTO notes (user_id, title, description, body, is_public)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [userId, title, description, body, isPublic || false];
        const { rows } = await query(sql, values);
        return rows[0];
    }

    /**
     * Get all notes visible to a specific user 
     * (Their own private notes + all public notes from anyone)
     */
    static async getVisibleNotes(userId) {
        const sql = `
            SELECT 
                n.*, 
                u.full_name AS creator_name,
                u.profile_image
            FROM notes n
            JOIN users u ON n.user_id = u.user_id
            WHERE n.is_public = TRUE OR n.user_id = $1
            ORDER BY n.created_at DESC;
        `;
        const { rows } = await query(sql, [userId]);
        return rows;
    }

    /**
     * Get a specific note by ID (with visibility protection)
     */
    static async getNoteById(noteId, userId) {
        const sql = `
            SELECT 
                n.*, 
                u.full_name AS creator_name,
                u.profile_image
            FROM notes n
            JOIN users u ON n.user_id = u.user_id
            WHERE n.note_id = $1 
              AND (n.is_public = TRUE OR n.user_id = $2);
        `;
        const { rows } = await query(sql, [noteId, userId]);
        return rows[0];
    }

    /**
     * Update a note (Strict: Only the creator can update)
     */
    static async updateNote(noteId, userId, { title, description, body, isPublic }) {
        const sql = `
            UPDATE notes
            SET 
                title = $1, 
                description = $2, 
                body = $3, 
                is_public = $4, 
                updated_at = CURRENT_TIMESTAMP
            WHERE note_id = $5 AND user_id = $6
            RETURNING *;
        `;
        const values = [title, description, body, isPublic, noteId, userId];
        const { rows } = await query(sql, values);
        return rows[0];
    }

    /**
     * Delete a note (Strict: Only the creator can delete)
     */
    static async deleteNote(noteId, userId) {
        const sql = `
            DELETE FROM notes
            WHERE note_id = $1 AND user_id = $2
            RETURNING note_id;
        `;
        const { rows } = await query(sql, [noteId, userId]);
        return rows[0];
    }

    /**
     * Search visible notes by title, description, or body
     */
    static async searchNotes(userId, searchTerm) {
        const sql = `
            SELECT 
                n.*, 
                u.full_name AS creator_name
            FROM notes n
            JOIN users u ON n.user_id = u.user_id
            WHERE (n.is_public = TRUE OR n.user_id = $1)
              AND (n.title ILIKE $2 OR n.description ILIKE $2 OR n.body ILIKE $2)
            ORDER BY n.created_at DESC;
        `;
        const { rows } = await query(sql, [userId, `%${searchTerm}%`]);
        return rows;
    }
}

module.exports = NoteModel;