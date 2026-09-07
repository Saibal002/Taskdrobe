const TeamModel = require("../models/teamModel");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");

class TeamService {

    // =========================
    // Manager: Create Team
    // =========================

    static async createTeam(managerId, teamName, description) {

        if (!teamName || !teamName.trim()) {
            throw new AppError("Team name is required.", 400);
        }

        return await TeamModel.createTeam(
            managerId,
            teamName.trim(),
            description ? description.trim() : null
        );
    }


    // =========================
    // Manager: View Own Teams
    // =========================

   static async getManagerTeams(managerId) {
    // 1. Fetch the base teams
    const teams = await TeamModel.findTeamsByManager(managerId);
    
    // 2. Loop through each team and fetch its members
    for (let team of teams) {
        const members = await TeamModel.findTeamMembers(team.team_id);
        
        // 3. Attach the members array and count to the team object
        team.members = members;
        team.member_count = members.length;
    }

    // 4. Return the enriched data back to the controller
    return teams;
}

    // =========================
    // View Team
    // =========================

    static async getTeam(teamId) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        return team;
    }


    // =========================
    // Manager: Edit Team
    // =========================

    static async updateTeam(
        teamId,
        managerId,
        teamName,
        description
    ) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        // Only the manager who owns the team can edit it
        if (team.manager_id !== managerId) {
            throw new AppError(
                "You are not authorized to edit this team.",
                403
            );
        }

        if (!teamName || !teamName.trim()) {
            throw new AppError("Team name is required.", 400);
        }

        return await TeamModel.updateTeam(
            teamId,
            teamName.trim(),
            description ? description.trim() : null
        );
    }


    // =========================
    // Manager: Delete Team
    // =========================

    static async deleteTeam(teamId, managerId) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        // Only the manager who owns the team can delete it
        if (team.manager_id !== managerId) {
            throw new AppError(
                "You are not authorized to delete this team.",
                403
            );
        }

        return await TeamModel.deleteTeam(teamId);
    }


    // =========================
    // Manager: View Members
    // =========================

    static async getTeamMembers(teamId, managerId) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        if (team.manager_id !== managerId) {
            throw new AppError(
                "You are not authorized to view this team's members.",
                403
            );
        }

        return await TeamModel.findTeamMembers(teamId);
    }


    // =========================
    // Manager: Add Employee
    // =========================

    static async addMember(teamId, managerId, userId) {

    const team = await TeamModel.findTeamById(teamId);

    if (!team) {
        throw new AppError("Team not found.", 404);
    }

    if (team.manager_id !== managerId) {
        throw new AppError(
            "You are not authorized to manage this team.",
            403
        );
    }

    const user = await userModel.findUserById(userId);

    if (!user) {
        throw new AppError(
            "Employee not found.",
            404
        );
    }

    if (user.role_name !== "employee") {
        throw new AppError(
            "Only employees can be added to a team.",
            400
        );
    }

    const alreadyMember = await TeamModel.isMember(
        teamId,
        userId
    );

    if (alreadyMember) {
        throw new AppError(
            "Employee is already a member of this team.",
            409
        );
    }

    return await TeamModel.addMember(
        teamId,
        userId
    );
}

    // =========================
    // Manager: Remove Employee
    // =========================

    static async removeMember(
        teamId,
        managerId,
        userId
    ) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        if (team.manager_id !== managerId) {
            throw new AppError(
                "You are not authorized to manage this team.",
                403
            );
        }

        const removedMember = await TeamModel.removeMember(
            teamId,
            userId
        );

        if (!removedMember) {
            throw new AppError(
                "Employee is not a member of this team.",
                404
            );
        }

        return removedMember;
    }


    // =========================
    // Employee: View My Teams
    // =========================

    static async getEmployeeTeams(userId) {

        return await TeamModel.findEmployeeTeams(userId);
    }


    // =========================
    // Employee: View Team
    // =========================

    static async getEmployeeTeam(teamId, userId) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        const isMember = await TeamModel.isMember(
            teamId,
            userId
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this team.",
                403
            );
        }

        return team;
    }


    // =========================
    // Employee: View Team Members
    // =========================

    static async getEmployeeTeamMembers(
        teamId,
        userId
    ) {

        const team = await TeamModel.findTeamById(teamId);

        if (!team) {
            throw new AppError("Team not found.", 404);
        }

        const isMember = await TeamModel.isMember(
            teamId,
            userId
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this team.",
                403
            );
        }

        return await TeamModel.findTeamMembers(teamId);
    }
}

module.exports = TeamService;