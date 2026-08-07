const AppError = require("../utils/AppError");

const taskModel = require("../models/taskModel");
const projectService = require("./projectService");

/**
 * Create Task
 */
const createTask = async (taskData) => {

    const task = await taskModel.createTask(taskData);

    await projectService.updateProjectProgress(
        task.project_id
    );

    return task;

};

/**
 * Get Tasks By Project
 */
const getTasksByProject = async (projectId) => {

    return await taskModel.getTasksByProject(projectId);

};

/**
 * Get Single Task
 */
const getTaskById = async (taskId) => {

    const task = await taskModel.getTaskById(taskId);

    if (!task) {

        throw new AppError(
            "Task not found.",
            404
        );

    }

    return task;

};

/**
 * Update Task
 */
const updateTask = async (taskId, taskData) => {

    await getTaskById(taskId);

    const task = await taskModel.updateTask(
        taskId,
        taskData
    );

    await projectService.updateProjectProgress(
        task.project_id
    );

    return task;

};

/**
 * Delete Task
 */
const deleteTask = async (taskId) => {

    const task = await getTaskById(taskId);

    await taskModel.deleteTask(taskId);

    await projectService.updateProjectProgress(
        task.project_id
    );

    return task;

};

/**
 * Toggle Task Status
 */
const toggleTaskStatus = async (taskId) => {

    await getTaskById(taskId);

    const task = await taskModel.toggleTaskStatus(taskId);

    await projectService.updateProjectProgress(
        task.project_id
    );

    return task;

};

module.exports = {

    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
    toggleTaskStatus,

};