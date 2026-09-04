const TeamService = require("../services/teamService");

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
}

module.exports = TeamController;