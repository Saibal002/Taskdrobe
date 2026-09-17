const TeamService = require("../services/teamService");
const TeamModel = require("../models/teamModel");
const userModel = require("../models/userModel");
class TeamController {

    // =========================
    // Manager: Create Team
    // =========================

    static async createTeam(req, res, next) {
        try {
            console.log("🔥 TEAM CONTROLLER HIT");
            const { teamName, description } = req.body;
            const managerId = req.user.user_id;

            const team = await TeamService.createTeam(
                managerId,
                teamName,
                description
            );

            return res.status(201).json({
                success: true,
                message: "Team created successfully.",
                data: team
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Manager: View Own Teams
    // =========================

    static async getManagerTeams(req, res, next) {
        try {
            const managerId = req.user.user_id;

            const teams = await TeamService.getManagerTeams(
                managerId
            );

            return res.status(200).json({
                success: true,
                data: teams
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // View Team
    // =========================

    static async getTeam(req, res, next) {
        try {
            const { teamId } = req.params;

            const team = await TeamService.getTeam(teamId);

            return res.status(200).json({
                success: true,
                data: team
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Manager: Edit Team
    // =========================

    static async updateTeam(req, res, next) {
        try {
            const { teamId } = req.params;
            const { teamName, description } = req.body;
            const managerId = req.user.user_id;

            const team = await TeamService.updateTeam(
                teamId,
                managerId,
                teamName,
                description
            );

            return res.status(200).json({
                success: true,
                message: "Team updated successfully.",
                data: team
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Manager: Delete Team
    // =========================

    static async deleteTeam(req, res, next) {
        try {
            const { teamId } = req.params;
            const managerId = req.user.user_id;

            await TeamService.deleteTeam(
                teamId,
                managerId
            );

            return res.status(200).json({
                success: true,
                message: "Team deleted successfully."
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Manager: View Members
    // =========================

    static async getTeamMembers(req, res, next) {
        try {
            const { teamId } = req.params;
            const managerId = req.user.user_id;

            const members = await TeamService.getTeamMembers(
                teamId,
                managerId
            );

            return res.status(200).json({
                success: true,
                data: members
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Manager: Add Employee
    // =========================

    static async addMember(req, res, next) {
        try {
            const { teamId } = req.params;
            const { userId } = req.body;
            const managerId = req.user.user_id;

            const member = await TeamService.addMember(
                teamId,
                managerId,
                userId
            );

            return res.status(201).json({
                success: true,
                message: "Employee added to team successfully.",
                data: member
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Manager: Remove Employee
    // =========================

    static async removeMember(req, res, next) {
        try {
            const { teamId, userId } = req.params;
            const managerId = req.user.user_id;

            await TeamService.removeMember(
                teamId,
                managerId,
                userId
            );

            return res.status(200).json({
                success: true,
                message: "Employee removed from team successfully."
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Employee: View My Teams
    // =========================

    static async getEmployeeTeams(req, res, next) {
        try {
            const userId = req.user.user_id;

            const teams = await TeamService.getEmployeeTeams(
                userId
            );

            return res.status(200).json({
                success: true,
                data: teams
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Employee: View Team
    // =========================

    static async getEmployeeTeam(req, res, next) {
        try {
            const { teamId } = req.params;
            const userId = req.user.user_id;

            const team = await TeamService.getEmployeeTeam(
                teamId,
                userId
            );

            return res.status(200).json({
                success: true,
                data: team
            });

        } catch (error) {
            next(error);
        }
    }


    // =========================
    // Employee: View Team Members
    // =========================

    static async getEmployeeTeamMembers(req, res, next) {
        try {
            const { teamId } = req.params;
            const userId = req.user.user_id;

            const members =
                await TeamService.getEmployeeTeamMembers(
                    teamId,
                    userId
                );

            return res.status(200).json({
                success: true,
                data: members
            });

        } catch (error) {
            next(error);
        }
    }
    static async getManagerSubordinates(req, res, next) {
        try {
            const managerId = req.user.user_id;
            const employees = await TeamModel.getEmployeesByManager(managerId);
            
            return res.status(200).json({
                success: true,
                data: employees
            });
        } catch (error) {
            next(error);
        }
    }
    // =========================
    // Manager: Get Available Employees
    // =========================
    static async getAvailableEmployeesForTeam(req, res, next) {
        try {
            const { teamId } = req.params;
            
            // 1. Get all employees in the system
            const allEmployees = await userModel.getAllEmployees();
            
            // 2. Get current team members
            const teamMembers = await TeamModel.findTeamMembers(teamId);
            const memberIds = new Set(teamMembers.map(m => String(m.user_id)));
            
            // 3. Filter out employees already in the team
            const available = allEmployees.filter(emp => !memberIds.has(String(emp.user_id)));

            return res.status(200).json({
                success: true,
                data: available
            });
        } catch (error) {
            next(error);
        }
    }
    // =========================
    // Manager: Team Insight Data
    // =========================

    static async getTeamProjects(req, res, next) {
        try {
            const { teamId } = req.params;
            const projects = await TeamModel.getTeamProjects(teamId);
            
            return res.status(200).json({
                success: true,
                data: projects
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTeamTasks(req, res, next) {
        try {
            const { teamId } = req.params;
            const tasks = await TeamModel.getTeamTasks(teamId);
            
            return res.status(200).json({
                success: true,
                data: tasks
            });
        } catch (error) {
            next(error);
        }
    }

    static async getTeamAnalytics(req, res, next) {
        try {
            const { teamId } = req.params;
            const analytics = await TeamModel.getTeamAnalytics(teamId);
            
            return res.status(200).json({
                success: true,
                data: analytics
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TeamController;