const query = require("../plugins/query");
const AppError = require("../utils/AppError");

class MeetingModel {
    /**
     * Check if a proposed time slot overlaps with any existing meeting.
     * Logic: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
     */
    static async checkOverlap(startTime, endTime) {
        const sql = `
            SELECT meeting_id FROM meetings
            WHERE start_time < $2 AND end_time > $1;
        `;
        const { rows } = await query(sql, [startTime, endTime]);
        return rows.length > 0;
    }

    /**
     * Create a new meeting (Enforces no-overlap strictness)
     */
    static async createMeeting({ organizerId, title, description, meetingLink, startTime, endTime }) {
        // 1. Enforce strict non-overlapping rule
        const hasOverlap = await this.checkOverlap(startTime, endTime);
        if (hasOverlap) {
            throw new AppError("This time slot overlaps with an existing meeting in the workspace.", 409);
        }

        // 2. Insert if the time slot is free
        const sql = `
            INSERT INTO meetings (organizer_id, title, description, meeting_link, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [organizerId, title, description, meetingLink, startTime, endTime];
        const { rows } = await query(sql, values);
        return rows[0];
    }

    /**
     * Get all upcoming meetings across the workspace
     */
    static async getUpcomingMeetings() {
        const sql = `
            SELECT 
                m.*, 
                u.full_name AS organizer_name,
                u.profile_image
            FROM meetings m
            JOIN users u ON m.organizer_id = u.user_id
            WHERE m.end_time > CURRENT_TIMESTAMP
            ORDER BY m.start_time ASC;
        `;
        const { rows } = await query(sql);
        return rows;
    }

    /**
     * Delete a meeting (Strict: Only the organizer can delete)
     */
    static async deleteMeeting(meetingId, userId) {
        const sql = `
            DELETE FROM meetings
            WHERE meeting_id = $1 AND organizer_id = $2
            RETURNING meeting_id;
        `;
        const { rows } = await query(sql, [meetingId, userId]);
        return rows[0];
    }
}

module.exports = MeetingModel;