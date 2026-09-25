const query = require("../plugins/query");
const AppError = require("../utils/AppError");

class MeetingModel {
    /**
     * Check if the selected team already has an overlapping meeting
     */
    static async checkOverlap(teamId, startTime, endTime) {
        const sql = `
            SELECT meeting_id FROM meetings
            WHERE team_id = $1 AND start_time < $3 AND end_time > $2;
        `;
        const { rows } = await query(sql, [Number(teamId), startTime, endTime]);
        return rows.length > 0;
    }

    /**
     * Create a new team meeting
     */
    static async createMeeting({ organizerId, teamId, title, description, meetingLink, startTime, endTime }) {
        const hasOverlap = await this.checkOverlap(teamId, startTime, endTime);
        if (hasOverlap) {
            throw new AppError("This team already has a meeting scheduled during this time slot.", 409);
        }

        const sql = `
            INSERT INTO meetings (organizer_id, team_id, title, description, meeting_link, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [Number(organizerId), Number(teamId), title, description, meetingLink, startTime, endTime];
        const { rows } = await query(sql, values);
        return rows[0];
    }

    /**
     * Get upcoming meetings for teams the user manages, belongs to, or organized
     */
    static async getUpcomingMeetings(userId) {
        const sql = `
            SELECT DISTINCT
                m.*, 
                u.full_name AS organizer_name,
                t.team_name
            FROM meetings m
            JOIN users u ON m.organizer_id = u.user_id
            JOIN teams t ON m.team_id = t.team_id
            LEFT JOIN team_members tm ON m.team_id = tm.team_id
            WHERE m.end_time > CURRENT_TIMESTAMP
              AND (m.organizer_id = $1 OR t.manager_id = $1 OR tm.user_id = $1)
            ORDER BY m.start_time ASC;
        `;
        const { rows } = await query(sql, [Number(userId)]);
        return rows;
    }

    /**
     * Get teams the user manages or belongs to (for the modal dropdown)
     */
    static async getUserTeams(userId) {
        const sql = `
            SELECT DISTINCT t.team_id, t.team_name
            FROM teams t
            LEFT JOIN team_members tm ON t.team_id = tm.team_id
            WHERE t.manager_id = $1 OR tm.user_id = $1
            ORDER BY t.team_name ASC;
        `;
        const { rows } = await query(sql, [Number(userId)]);
        return rows;
    }

    /**
     * Get all user_ids (manager + members) for a specific team
     */
    static async getTeamRecipientIds(teamId) {
        const sql = `
            SELECT manager_id AS user_id FROM teams WHERE team_id = $1
            UNION
            SELECT user_id FROM team_members WHERE team_id = $1;
        `;
        const { rows } = await query(sql, [Number(teamId)]);
        return rows.map(r => Number(r.user_id));
    }

    /**
     * Hard delete a meeting from the database
     */
    static async deleteMeeting(meetingId, userId) {
        const sql = `
            DELETE FROM meetings
            WHERE meeting_id = $1 AND organizer_id = $2
            RETURNING meeting_id;
        `;
        const { rows } = await query(sql, [Number(meetingId), Number(userId)]);
        return rows[0];
    }
}

module.exports = MeetingModel;