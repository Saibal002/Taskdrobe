const TeamModel = require("../models/teamModel");
const UserModel = require("../models/userModel");
const RoleModel = require("../models/roleModel");
const AppError = require("../utils/AppError");

class AdminService {

    // ===================================
    // GOD MODE: TEAM MANAGEMENT
    // ===================================
    static async getAllCompanyTeams() {
        const teams = await TeamModel.findAllTeamsGlobal();
        
        // Enrich with member counts just like the manager view
        for (let team of teams) {
            const members = await TeamModel.findTeamMembers(team.team_id);
            team.members = members;
            team.member_count = members.length;
        }
        return teams;
    }

    static async getAnyTeam(teamId) {
        const team = await TeamModel.findTeamById(teamId);
        if (!team) throw new AppError("Team not found.", 404);
        return team;
    }

    static async getAnyTeamMembers(teamId) {
        // Skips the manager ownership check completely
        return await TeamModel.findTeamMembers(teamId);
    }

    static async forceDeleteTeam(teamId) {
        // Deletes without checking who the manager is
        return await TeamModel.deleteTeam(teamId);
    }

    // ===================================
    // GOD MODE: USER MANAGEMENT
    // ===================================
    static async getAllSystemUsers() {
        // Reusing the exact SQL from your userModel to get everyone
        const query = require("../plugins/query");
        const sql = `
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.is_active,
                r.role_name,
                p.phone
            FROM users u
            INNER JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN user_profiles p ON u.user_id = p.user_id
            ORDER BY u.created_at DESC;
        `;
        const { rows } = await query(sql);
        return rows;
    }

    static async getAllRoles() {
        return await RoleModel.getAllRoles();
    }
   static async updateUser(userId, data) {
        // Find the correct role_id from the role_name provided in the form
        const role = await RoleModel.findRoleByName(data.roleName);
        if (!role) throw new AppError("Invalid role selected.", 400);

        // Convert the string "true"/"false" from the form into a boolean
        const isActive = data.isActive === 'true' || data.isActive === true;

        const updatedUser = await UserModel.updateUserAdmin(userId, data.fullName, data.email, role.role_id, isActive);
        if (!updatedUser) throw new AppError("User not found or update failed.", 404);
        
        return updatedUser;
    }

    static async deleteUser(userId) {
        const deletedUser = await UserModel.deleteUser(userId);
        if (!deletedUser) throw new AppError("User not found.", 404);
        return deletedUser;
    }
}

module.exports = AdminService;