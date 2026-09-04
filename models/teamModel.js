const db = require("../plugins/db");

class TeamModel {

    // =========================
    // Team Operations
    // =========================

    static async createTeam(managerId, teamName, description) {
        const query = `
            INSERT INTO teams
            (
                manager_id,
                team_name,
                description
            )
            VALUES ($1, $2, $3)
            RETURNING
                team_id,
                manager_id,
                team_name,
                description,
                created_at,
                updated_at
        `;

        const values = [
            managerId,
            teamName,
            description
        ];

        const result = await db.query(query, values);

        return result.rows[0];
    }


    static async findTeamById(teamId) {
        const query = `
            SELECT
                team_id,
                manager_id,
                team_name,
                description,
                created_at,
                updated_at
            FROM teams
            WHERE team_id = $1
        `;

        const result = await db.query(query, [teamId]);

        return result.rows[0];
    }


    static async findTeamsByManager(managerId) {
        const query = `
            SELECT
                team_id,
                manager_id,
                team_name,
                description,
                created_at,
                updated_at
            FROM teams
            WHERE manager_id = $1
            ORDER BY created_at DESC
        `;

        const result = await db.query(query, [managerId]);

        return result.rows;
    }


    static async updateTeam(teamId, teamName, description) {
        const query = `
            UPDATE teams
            SET
                team_name = $1,
                description = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE team_id = $3
            RETURNING
                team_id,
                manager_id,
                team_name,
                description,
                created_at,
                updated_at
        `;

        const values = [
            teamName,
            description,
            teamId
        ];

        const result = await db.query(query, values);

        return result.rows[0];
    }


    static async deleteTeam(teamId) {
        const query = `
            DELETE FROM teams
            WHERE team_id = $1
            RETURNING team_id
        `;

        const result = await db.query(query, [teamId]);

        return result.rows[0];
    }


    // =========================
    // Team Membership Operations
    // =========================

    static async addMember(teamId, userId) {
        const query = `
            INSERT INTO team_members
            (
                team_id,
                user_id
            )
            VALUES ($1, $2)
            RETURNING
                team_member_id,
                team_id,
                user_id,
                joined_at
        `;

        const values = [
            teamId,
            userId
        ];

        const result = await db.query(query, values);

        return result.rows[0];
    }


    static async removeMember(teamId, userId) {
        const query = `
            DELETE FROM team_members
            WHERE team_id = $1
              AND user_id = $2
            RETURNING
                team_member_id,
                team_id,
                user_id
        `;

        const result = await db.query(query, [
            teamId,
            userId
        ]);

        return result.rows[0];
    }


    static async findTeamMembers(teamId) {
        const query = `
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                u.profile_image,
                tm.joined_at
            FROM team_members tm
            INNER JOIN users u
                ON u.user_id = tm.user_id
            WHERE tm.team_id = $1
            ORDER BY tm.joined_at ASC
        `;

        const result = await db.query(query, [teamId]);

        return result.rows;
    }


    static async findEmployeeTeams(userId) {
        const query = `
            SELECT
                t.team_id,
                t.manager_id,
                t.team_name,
                t.description,
                t.created_at,
                t.updated_at,
                tm.joined_at
            FROM team_members tm
            INNER JOIN teams t
                ON t.team_id = tm.team_id
            WHERE tm.user_id = $1
            ORDER BY tm.joined_at DESC
        `;

        const result = await db.query(query, [userId]);

        return result.rows;
    }


    static async isMember(teamId, userId) {
        const query = `
            SELECT 1
            FROM team_members
            WHERE team_id = $1
              AND user_id = $2
            LIMIT 1
        `;

        const result = await db.query(query, [
            teamId,
            userId
        ]);

        return result.rowCount > 0;
    }
}

module.exports = TeamModel;