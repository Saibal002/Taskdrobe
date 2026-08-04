const projectModel = require("../models/projectModel");
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

module.exports = {
    createProject,
    getAllProjects,
};