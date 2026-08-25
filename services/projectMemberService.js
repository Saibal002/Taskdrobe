const projectMemberModel = require("../models/projectMemberModel");
const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
const AppError = require("../utils/AppError");

/**
 * Add Employee To Project
 */
const addMember = async (projectId, userId) => {

    // Check project exists
    const project = await projectModel.getProjectById(projectId);

    if (!project) {
        throw new AppError("Project not found.", 404);
    }

    // Check user exists
    const user = await userModel.findUserById(userId);

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    // Only employees can be assigned as project members
    if (user.role_name !== "employee") {
        throw new AppError(
            "Only employees can be assigned to projects.",
            400
        );
    }

    // Don't allow inactive employees
    if (!user.is_active) {
        throw new AppError(
            "Cannot assign an inactive user to a project.",
            400
        );
    }

    // Check existing membership
    const alreadyMember =
        await projectMemberModel.isProjectMember(
            projectId,
            userId
        );

    if (alreadyMember) {
        throw new AppError(
            "User is already a member of this project.",
            409
        );
    }

    return await projectMemberModel.addProjectMember(
        projectId,
        userId
    );
};


/**
 * Remove Employee From Project
 */
const removeMember = async (projectId, userId) => {

    const membership =
        await projectMemberModel.removeProjectMember(
            projectId,
            userId
        );

    if (!membership) {
        throw new AppError(
            "Project member not found.",
            404
        );
    }

    return membership;
};


/**
 * Get Project Members
 */
const getMembers = async (projectId) => {

    const project =
        await projectModel.getProjectById(projectId);

    if (!project) {
        throw new AppError(
            "Project not found.",
            404
        );
    }

    return await projectMemberModel.getProjectMembers(
        projectId
    );
};


/**
 * Check Project Membership
 */
const isMember = async (projectId, userId) => {

    return await projectMemberModel.isProjectMember(
        projectId,
        userId
    );

};


module.exports = {
    addMember,
    removeMember,
    getMembers,
    isMember,
};