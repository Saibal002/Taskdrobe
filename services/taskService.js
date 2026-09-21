const AppError = require("../utils/AppError");
const taskModel = require("../models/taskModel");
const projectService = require("./projectService");
const teamModel = require("../models/teamModel");

const verifyProjectAccess = async (projectId, user) => {
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new AppError("Project not found.", 404);

    if (user.role_name === "admin") return project;

    if (user.role_name === "manager") {
        if (String(project.created_by) !== String(user.user_id)) {
            throw new AppError("You do not have permission to access this project.", 403);
        }
        return project;
    }

    if (user.role_name === "employee") {
        const isMember = await teamModel.isMember(project.team_id, user.user_id);
        if (!isMember) {
            throw new AppError("You are not a member of the team assigned to this project.", 403);
        }
        return project;
    }

    throw new AppError("You do not have permission to access this project.", 403);
};

const getTaskOrThrow = async (taskId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError("Task not found.", 404);
    return task;
};

const verifyTaskEditAccess = async (task, user) => {
    await verifyProjectAccess(task.project_id, user);
    if (user.role_name === "admin" || user.role_name === "manager") return;
    if (user.role_name === "employee" && String(task.created_by) === String(user.user_id)) return;
    throw new AppError("You can only edit tasks you created.", 403);
};

const verifyTaskDeleteAccess = async (task, user) => {
    await verifyProjectAccess(task.project_id, user);
    if (user.role_name === "admin" || user.role_name === "manager") return;
    if (user.role_name === "employee" && String(task.created_by) === String(user.user_id)) return;
    throw new AppError("You can only delete tasks you created.", 403);
};

const verifyTaskStatusAccess = async (task, user) => {
    await verifyProjectAccess(task.project_id, user);
    if (user.role_name === "admin" || user.role_name === "manager") return;
    if (user.role_name === "employee" && String(task.created_by) === String(user.user_id)) return;
    if (user.role_name === "employee" && task.assigned_to && String(task.assigned_to) === String(user.user_id)) return;
    throw new AppError("You do not have permission to change this task's status.", 403);
};

const verifyTaskAssignmentAccess = async (task, user) => {
    if (user.role_name !== "admin" && user.role_name !== "manager") {
        throw new AppError("Only the project manager or an admin can assign tasks.", 403);
    }
    await verifyProjectAccess(task.project_id, user);
};

const updateTaskAssignment = async (taskId, assignedTo, user) => {
    const task = await getTaskOrThrow(taskId);
    const project = await verifyProjectAccess(task.project_id, user);
    await verifyTaskAssignmentAccess(task, user);

    const normalizedAssignedTo = assignedTo === "" || assignedTo == null ? null : assignedTo;

    if (normalizedAssignedTo) {
        const isMember = await teamModel.isMember(project.team_id, normalizedAssignedTo);
        if (!isMember) {
            throw new AppError("The assigned employee is not a member of the team assigned to this project.", 400);
        }
    }
    return await taskModel.updateTaskAssignment(taskId, normalizedAssignedTo);
};

const createTask = async (taskData, user) => {
    const { projectId, assignedTo } = taskData;
    taskData.assignedTo = assignedTo === "" || assignedTo == null ? null : assignedTo;

    const project = await verifyProjectAccess(projectId, user);

    if (user.role_name === "employee" && taskData.assignedTo) {
        throw new AppError("Employees cannot assign tasks.", 403);
    }
    if (user.role_name === "employee") {
        taskData.assignedTo = user.user_id;
    }
    if (user.role_name === "manager" && taskData.assignedTo) {
        const isMember = await teamModel.isMember(project.team_id, taskData.assignedTo);
        if (!isMember) {
            throw new AppError("The assigned employee is not a member of the team assigned to this project.", 400);
        }
    }

    taskData.createdBy = user.user_id;
    const task = await taskModel.createTask(taskData);
    await projectService.updateProjectProgress(task.project_id);
    return task;
};

const getTasksByProject = async (projectId, user) => {
    await verifyProjectAccess(projectId, user);
    return await taskModel.getTasksByProject(projectId);
};

const getTaskById = async (taskId, user) => {
    const task = await getTaskOrThrow(taskId);
    await verifyProjectAccess(task.project_id, user);
    return task;
};

const updateTask = async (taskId, taskData, user) => {
    const task = await getTaskOrThrow(taskId);
    await verifyTaskEditAccess(task, user);
    const updatedTask = await taskModel.updateTask(taskId, taskData);
    await projectService.updateProjectProgress(updatedTask.project_id);
    return updatedTask;
};

const deleteTask = async (taskId, user) => {
    const task = await getTaskOrThrow(taskId);
    await verifyTaskDeleteAccess(task, user);
    await taskModel.deleteTask(taskId);
    await projectService.updateProjectProgress(task.project_id);
    return task;
};

const toggleTaskStatus = async (taskId, user) => {
    const task = await getTaskOrThrow(taskId);
    await verifyTaskStatusAccess(task, user);
    const updatedTask = await taskModel.toggleTaskStatus(taskId);
    await projectService.updateProjectProgress(updatedTask.project_id);
    return updatedTask;
};

const getAllTasks = async () => await taskModel.getAllTasks();
const getTasksByManager = async (managerId) => await taskModel.getTasksByManager(managerId);
const getTasksByEmployeeProjects = async (userId) => await taskModel.getTasksByEmployeeProjects(userId);

module.exports = {
    createTask, getTasksByProject, getTaskById, updateTask, deleteTask, toggleTaskStatus,
    updateTaskAssignment, getAllTasks, getTasksByManager, getTasksByEmployeeProjects
};