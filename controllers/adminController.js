const AdminService = require("../services/adminService");
const authService = require("../services/authService");

class AdminController {

    // ===================================
    // VIEWS
    // ===================================
    static async renderUserManagement(req, res, next) {
        try {
            const users = await AdminService.getAllSystemUsers();
            const roles = await AdminService.getAllRoles();
            
            res.render("admin/users", {
                title: "User Management",
                user: req.user,
                users,
                roles,
                page: "users"
            });
        } catch (error) {
            next(error);
        }
    }

    // ===================================
    // AJAX ENDPOINTS: TEAMS
    // ===================================
    static async getAllTeams(req, res, next) {
        try {
            const teams = await AdminService.getAllCompanyTeams();
            return res.status(200).json({ success: true, data: teams });
        } catch (error) {
            next(error);
        }
    }

    static async getTeamDetails(req, res, next) {
        try {
            const team = await AdminService.getAnyTeam(req.params.teamId);
            return res.status(200).json({ success: true, data: team });
        } catch (error) {
            next(error);
        }
    }

    static async forceDeleteTeam(req, res, next) {
        try {
            await AdminService.forceDeleteTeam(req.params.teamId);
            return res.status(200).json({ success: true, message: "Team deleted by Admin." });
        } catch (error) {
            next(error);
        }
    }

    // ===================================
    // AJAX ENDPOINTS: USERS
    // ===================================
    static async adminCreateUser(req, res, next) {
        try {
            // Using your existing authService logic, but triggered by an Admin
            const { fullName, email, password, roleName } = req.body;
            
            const newUser = await authService.registerUser({
                fullName,
                email,
                password,
                roleName 
            });

            return res.status(201).json({
                success: true,
                message: "User provisioned successfully.",
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    }
    static async adminUpdateUser(req, res, next) {
        try {
            const { userId } = req.params;
            const updatedUser = await AdminService.updateUser(userId, req.body);
            
            return res.status(200).json({
                success: true,
                message: "User updated successfully.",
                data: { ...updatedUser, role_name: req.body.roleName } // Pass back for UI update
            });
        } catch (error) {
            next(error);
        }
    }

    static async adminDeleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            await AdminService.deleteUser(userId);
            
            return res.status(200).json({
                success: true,
                message: "User access revoked and deleted."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;