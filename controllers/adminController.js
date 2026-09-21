const AdminService = require("../services/adminService");
const authService = require("../services/authService");
const ActivityService = require("../services/activityService"); // INJECTED LOGGER

class AdminController {
    static async renderUserManagement(req, res, next) {
        try {
            const users = await AdminService.getAllSystemUsers();
            const roles = await AdminService.getAllRoles();
            res.render("admin/users", { title: "User Management", user: req.user, users, roles, page: "users" });
        } catch (error) { next(error); }
    }

    static async getAllTeams(req, res, next) {
        try {
            const teams = await AdminService.getAllCompanyTeams();
            return res.status(200).json({ success: true, data: teams });
        } catch (error) { next(error); }
    }

    static async getTeamDetails(req, res, next) {
        try {
            const team = await AdminService.getAnyTeam(req.params.teamId);
            return res.status(200).json({ success: true, data: team });
        } catch (error) { next(error); }
    }

    static async forceDeleteTeam(req, res, next) {
        try {
            await AdminService.forceDeleteTeam(req.params.teamId);
            
            ActivityService.log({
                userId: req.user.user_id, action: "DELETE", entityType: "Team", entityId: req.params.teamId,
                description: `Admin deleted team ID: ${req.params.teamId}`
            }).catch(err => console.error(err));

            return res.status(200).json({ success: true, message: "Team deleted by Admin." });
        } catch (error) { next(error); }
    }

    static async adminCreateUser(req, res, next) {
        try {
            const { fullName, email, password, roleName } = req.body;
            const newUser = await authService.registerUser({ fullName, email, password, roleName });

            ActivityService.log({
                userId: req.user.user_id, action: "CREATE", entityType: "User", entityId: newUser.user_id,
                description: `Provisioned new user: ${fullName} (${roleName})`
            }).catch(err => console.error(err));

            return res.status(201).json({ success: true, message: "User provisioned successfully.", data: newUser });
        } catch (error) { next(error); }
    }

    static async adminUpdateUser(req, res, next) {
        try {
            const { userId } = req.params;
            const updatedUser = await AdminService.updateUser(userId, req.body);
            
            ActivityService.log({
                userId: req.user.user_id, action: "UPDATE", entityType: "User", entityId: userId,
                description: `Updated user profile: ${updatedUser.full_name}`
            }).catch(err => console.error(err));

            return res.status(200).json({ success: true, message: "User updated successfully.", data: { ...updatedUser, role_name: req.body.roleName } });
        } catch (error) { next(error); }
    }

    static async adminDeleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            await AdminService.deleteUser(userId);
            
            ActivityService.log({
                userId: req.user.user_id, action: "DELETE", entityType: "User", entityId: userId,
                description: `Revoked and deleted user ID: ${userId}`
            }).catch(err => console.error(err));

            return res.status(200).json({ success: true, message: "User access revoked and deleted." });
        } catch (error) { next(error); }
    }

    static async renderTeamsView(req, res, next) { res.render("teams/teams", { title: "Global Teams", user: req.user, page: "teams" }); }
    static async renderTeamInsightView(req, res, next) { res.render("teams/team_insight", { title: "Team Insight", user: req.user, page: "teams", teamId: req.params.teamId }); }
    static async getTeamMembers(req, res, next) {
        try { const members = await require("../models/teamModel").findTeamMembers(req.params.teamId); return res.status(200).json({ success: true, data: members }); } catch (error) { next(error); }
    }
    static async getTeamProjects(req, res, next) {
        try { const projects = await require("../models/teamModel").getTeamProjects(req.params.teamId); return res.status(200).json({ success: true, data: projects }); } catch (error) { next(error); }
    }
    static async getTeamTasks(req, res, next) {
        try { const tasks = await require("../models/teamModel").getTeamTasks(req.params.teamId); return res.status(200).json({ success: true, data: tasks }); } catch (error) { next(error); }
    }
    static async getTeamAnalytics(req, res, next) {
        try { const analytics = await require("../models/teamModel").getTeamAnalytics(req.params.teamId); return res.status(200).json({ success: true, data: analytics }); } catch (error) { next(error); }
    }
}

module.exports = AdminController;