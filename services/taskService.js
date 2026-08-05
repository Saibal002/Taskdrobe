const AppError = require("../utils/AppError");
const taskModel = require("../models/taskModel");

/**
 * Create Task
 */
const createTask = async (taskData) => {

    return await taskModel.createTask(taskData);

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
        throw new AppError("Task not found.", 404);
    }

    return task;

};

/**
 * Update Task
 */
const updateTask = async (taskId, taskData) => {

    await getTaskById(taskId);

    return await taskModel.updateTask(taskId, taskData);

};

/**
 * Delete Task
 */
const deleteTask = async (taskId) => {

    await getTaskById(taskId);

    return await taskModel.deleteTask(taskId);

};

/**
 * Toggle Task Status
 */
const toggleTaskStatus = async (taskId) => {

    await getTaskById(taskId);

    return await taskModel.toggleTaskStatus(taskId);

};

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
    toggleTaskStatus,
};