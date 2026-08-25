const projectMemberModel = require("../models/projectMemberModel");
const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
const AppError = require("../utils/AppError");

/**
 * Verify Manager Owns Project
 */
const verifyProjectOwner = async (projectId, managerId) => {

    const project =
        await projectModel.getProjectById(projectId);

    if (!project) {
        throw new AppError("Project not found.", 404);
    }

    if (String(project.created_by) !== String(managerId)) {
        throw new AppError(
            "You do not have permission to manage this project.",
            403
        );
    }

    return project;
};


/**
 * Add Employee To Project
 */
const addMember = async (
    projectId,
    userId,
    managerId
) => {

    await verifyProjectOwner(
        projectId,
        managerId
    );

    const user =
        await userModel.findUserById(userId);

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    if (user.role_name !== "employee") {
        throw new AppError(
            "Only employees can be assigned to projects.",
            400
        );
    }

    if (!user.is_active) {
        throw new AppError(
            "Cannot assign an inactive user to a project.",
            400
        );
    }

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
const removeMember = async (
    projectId,
    userId,
    managerId
) => {

    await verifyProjectOwner(
        projectId,
        managerId
    );

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
const getMembers = async (
    projectId,
    managerId
) => {

    await verifyProjectOwner(
        projectId,
        managerId
    );

    return await projectMemberModel.getProjectMembers(
        projectId
    );
};


/**
 * Check Project Membership
 */
const isMember = async (
    projectId,
    userId
) => {

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