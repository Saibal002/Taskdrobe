const projectModel = require("../models/projectModel");
const taskModel = require("../models/taskModel");
const AppError = require("../utils/AppError");

/**
 * Create Project
 */
const createProject = async (projectData) => {

    const {
        projectName,
        description,
        status,
        progress,
        deadline,
        createdBy,
    } = projectData;

    // Basic Validation
    if (!projectName || projectName.trim() === "") {
        throw new AppError("Project name is required.", 400);
    }

    const project = await projectModel.createProject({
        projectName,
        description,
        status,
        progress,
        deadline,
        createdBy,
    });

    return project;
};

/**
 * Get All Projects
 */
const getAllProjects = async () => {

    return await projectModel.getAllProjects();

};
/**
 * Update Project
 */
const updateProject = async (
    projectId,
    managerId,
    projectData
) => {

    const project = await projectModel.updateProject(
        projectId,
        managerId,
        projectData
    );

    if (!project) {
        throw new AppError(
            "Project not found or you do not have permission to modify it.",
            404
        );
    }

    return project;
};


/**
 * Delete Project
 */
const deleteProject = async (
    projectId,
    managerId
) => {

    const project = await projectModel.deleteProject(
        projectId,
        managerId
    );

    if (!project) {
        throw new AppError(
            "Project not found or you do not have permission to delete it.",
            404
        );
    }

    return project;
};


const getProjectById = async (projectId) => {

    const project = await projectModel.getProjectById(projectId);

    if (!project) {
        throw new AppError("Project not found.", 404);
    }

    return project;

};
/**
 * Recalculate project progress
 */
const updateProjectProgress = async (projectId) => {

    const stats =
        await taskModel.getProjectTaskStats(projectId);

    let progress = 0;

    if (stats.totalTasks > 0) {

        progress = Math.round(
            (stats.completedTasks / stats.totalTasks) * 100
        );

    }

    return await projectModel.updateProjectProgress(
        projectId,
        progress
    );

};

/**
 * Get Manager Project Statistics
 */
const getManagerProjectStats = async (managerId) => {

    return await projectModel.getManagerProjectStats(managerId);

};
/**
 * Get Projects Assigned To Employee
 */
const getProjectsByMember = async (userId) => {

    return await projectModel.getProjectsByMember(userId);

};
/**
 * Get Projects Created By Manager
 */
const getProjectsByManager = async (managerId) => {
    return await projectModel.getProjectsByManager(managerId);
};

module.exports = {
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
    getProjectById,
    updateProjectProgress,
    getManagerProjectStats,
    getProjectsByMember,
    getProjectsByManager
};