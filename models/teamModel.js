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
    // =========================
    // Manager Hierarchy Checks
    // =========================

    static async getEmployeesByManager(managerId) {
        const query = `
            SELECT DISTINCT u.user_id, u.full_name, u.email, u.profile_image
            FROM team_members tm
            INNER JOIN teams t ON tm.team_id = t.team_id
            INNER JOIN users u ON tm.user_id = u.user_id
            WHERE t.manager_id = $1 AND u.is_active = TRUE
        `;
        const result = await db.query(query, [managerId]);
        return result.rows;
    }

    static async isEmployeeInManagerTeams(managerId, employeeId) {
        const query = `
            SELECT 1
            FROM team_members tm
            INNER JOIN teams t ON tm.team_id = t.team_id
            WHERE t.manager_id = $1 AND tm.user_id = $2
            LIMIT 1
        `;
        const result = await db.query(query, [managerId, employeeId]);
        return result.rowCount > 0;
    }

    // =========================
    // Team Insight Metrics
    // =========================

    static async getTeamProjects(teamId) {
        const query = `
            SELECT DISTINCT 
                p.project_id, 
                p.project_name, 
                p.status, 
                p.progress, 
                p.deadline,
                p.created_at
            FROM projects p
            INNER JOIN project_members pm ON p.project_id = pm.project_id
            INNER JOIN team_members tm ON pm.user_id = tm.user_id
            WHERE tm.team_id = $1
            ORDER BY p.created_at DESC
        `;
        const result = await db.query(query, [teamId]);
        return result.rows;
    }

    static async getTeamTasks(teamId) {
        const query = `
            SELECT 
                t.task_id, 
                t.title, 
                t.status, 
                t.priority, 
                t.due_date,
                p.project_id,
                p.project_name, 
                u.full_name AS assigned_user
            FROM tasks t
            INNER JOIN team_members tm ON t.assigned_to = tm.user_id
            INNER JOIN projects p ON t.project_id = p.project_id
            INNER JOIN users u ON t.assigned_to = u.user_id
            WHERE tm.team_id = $1
            ORDER BY t.due_date ASC NULLS LAST
        `;
        const result = await db.query(query, [teamId]);
        return result.rows;
    }
}


module.exports = TeamModel;