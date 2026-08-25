const AppError = require("../utils/AppError");

const taskModel = require("../models/taskModel");
const projectService = require("./projectService");
const projectMemberService = require("./projectMemberService");


/**
 * Verify that the user has access to the project.
 *
 * Manager:
 *   Must own the project.
 *
 * Employee:
 *   Must be a member of the project.
 */
const verifyProjectAccess = async (
    projectId,
    user
) => {

    const project =
        await projectService.getProjectById(projectId);

    if (!project) {
        throw new AppError(
            "Project not found.",
            404
        );
    }


    // Manager must own the project
    if (user.role_name === "manager") {

        if (
            String(project.created_by) !==
            String(user.user_id)
        ) {
            throw new AppError(
                "You do not have permission to access this project.",
                403
            );
        }

        return project;
    }


    // Employee must be a project member
    if (user.role_name === "employee") {

        const isMember =
            await projectMemberService.isMember(
                projectId,
                user.user_id
            );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this project.",
                403
            );
        }

        return project;
    }


    throw new AppError(
        "You do not have permission to access this project.",
        403
    );

};


/**
 * Verify that the task exists.
 */
const getTaskOrThrow = async (taskId) => {

    const task =
        await taskModel.getTaskById(taskId);

    if (!task) {
        throw new AppError(
            "Task not found.",
            404
        );
    }

    return task;

};


/**
 * Verify that the user can edit task details.
 *
 * Manager:
 *   Can edit any task in their own project.
 *
 * Employee:
 *   Can edit only tasks they created.
 */
const verifyTaskEditAccess = async (
    task,
    user
) => {

    await verifyProjectAccess(
        task.project_id,
        user
    );


    // Manager can edit any task
    // inside their own project.
    if (user.role_name === "manager") {
        return;
    }


    // Employee can edit tasks
    // they created themselves.
    if (
        user.role_name === "employee" &&
        String(task.created_by) ===
            String(user.user_id)
    ) {
        return;
    }


    throw new AppError(
        "You can only edit tasks you created.",
        403
    );

};


/**
 * Verify that the user can delete a task.
 *
 * Manager:
 *   Can delete any task in their own project.
 *
 * Employee:
 *   Can delete only tasks they created.
 */
const verifyTaskDeleteAccess = async (
    task,
    user
) => {

    await verifyProjectAccess(
        task.project_id,
        user
    );


    // Manager can delete any task
    // inside their own project.
    if (user.role_name === "manager") {
        return;
    }


    // Employee can delete only
    // tasks they created.
    if (
        user.role_name === "employee" &&
        String(task.created_by) ===
            String(user.user_id)
    ) {
        return;
    }


    throw new AppError(
        "You can only delete tasks you created.",
        403
    );

};


/**
 * Verify that the user can change
 * the task status.
 *
 * Manager:
 *   Can change any task status
 *   in their own project.
 *
 * Employee:
 *   Can change status if they:
 *   - created the task
 *   OR
 *   - are assigned to the task.
 */
const verifyTaskStatusAccess = async (
    task,
    user
) => {

    await verifyProjectAccess(
        task.project_id,
        user
    );


    // Manager can change any status
    // inside their own project.
    if (user.role_name === "manager") {
        return;
    }


    // Employee who created the task
    // can change its status.
    if (
        user.role_name === "employee" &&
        String(task.created_by) ===
            String(user.user_id)
    ) {
        return;
    }


    // Employee assigned to the task
    // can change its status.
    if (
        user.role_name === "employee" &&
        task.assigned_to &&
        String(task.assigned_to) ===
            String(user.user_id)
    ) {
        return;
    }


    throw new AppError(
        "You do not have permission to change this task's status.",
        403
    );

};

/**
 * Verify that the user can assign/reassign a task.
 *
 * Only the manager who owns the project can assign tasks.
 */
const verifyTaskAssignmentAccess = async (
    task,
    user
) => {

    if (user.role_name !== "manager") {

        throw new AppError(
            "Only the project manager can assign tasks.",
            403
        );

    }

    await verifyProjectAccess(
        task.project_id,
        user
    );

};
/**
 * Assign / Reassign Task
 */
const updateTaskAssignment = async (
    taskId,
    assignedTo,
    user
) => {

    const task =
        await getTaskOrThrow(taskId);

    await verifyTaskAssignmentAccess(
        task,
        user
    );


    // Allow manager to unassign task.
    const normalizedAssignedTo =
        assignedTo === "" || assignedTo == null
            ? null
            : assignedTo;


    // If assigning an employee,
    // they must belong to the project.
    if (normalizedAssignedTo) {

        const isMember =
            await projectMemberService.isMember(
                task.project_id,
                normalizedAssignedTo
            );

        if (!isMember) {

            throw new AppError(
                "The assigned employee is not a member of this project.",
                400
            );

        }

    }


    const updatedTask =
        await taskModel.updateTaskAssignment(
            taskId,
            normalizedAssignedTo
        );


    return updatedTask;

};

/**
 * Create Task
 */
const createTask = async (
    taskData,
    user
) => {

    const {
        projectId,
        assignedTo
    } = taskData;


    // Convert empty form value
    // into PostgreSQL NULL.
    taskData.assignedTo =
        assignedTo === "" || assignedTo == null
            ? null
            : assignedTo;


    // Verify project access.
    await verifyProjectAccess(
        projectId,
        user
    );


    // Employees cannot assign tasks.
    if (
        user.role_name === "employee" &&
        taskData.assignedTo
    ) {

        throw new AppError(
            "Employees cannot assign tasks.",
            403
        );

    }


    // Employee-created tasks
    // are automatically assigned
    // to the employee.
    if (
        user.role_name === "employee"
    ) {

        taskData.assignedTo =
            user.user_id;

    }


    // Manager can assign employees,
    // but only employees who belong
    // to this project.
    if (
        user.role_name === "manager" &&
        taskData.assignedTo
    ) {

        const isMember =
            await projectMemberService.isMember(
                projectId,
                taskData.assignedTo
            );

        if (!isMember) {

            throw new AppError(
                "The assigned employee is not a member of this project.",
                400
            );

        }

    }


    // Always use authenticated user
    // as the task creator.
    taskData.createdBy =
        user.user_id;


    const task =
        await taskModel.createTask(
            taskData
        );


    // Recalculate project progress.
    await projectService.updateProjectProgress(
        task.project_id
    );


    return task;

};


/**
 * Get Tasks By Project
 */
const getTasksByProject = async (
    projectId,
    user
) => {

    await verifyProjectAccess(
        projectId,
        user
    );

    return await taskModel.getTasksByProject(
        projectId
    );

};


/**
 * Get Single Task
 */
const getTaskById = async (
    taskId,
    user
) => {

    const task =
        await getTaskOrThrow(taskId);


    await verifyProjectAccess(
        task.project_id,
        user
    );


    return task;

};


/**
 * Update Task
 */
const updateTask = async (
    taskId,
    taskData,
    user
) => {

    const task =
        await getTaskOrThrow(taskId);


    await verifyTaskEditAccess(
        task,
        user
    );


    const updatedTask =
        await taskModel.updateTask(
            taskId,
            taskData
        );


    await projectService.updateProjectProgress(
        updatedTask.project_id
    );


    return updatedTask;

};


/**
 * Delete Task
 */
const deleteTask = async (
    taskId,
    user
) => {

    const task =
        await getTaskOrThrow(taskId);


    await verifyTaskDeleteAccess(
        task,
        user
    );


    await taskModel.deleteTask(
        taskId
    );


    await projectService.updateProjectProgress(
        task.project_id
    );


    return task;

};


/**
 * Toggle Task Status
 */
const toggleTaskStatus = async (
    taskId,
    user
) => {

    const task =
        await getTaskOrThrow(taskId);


    await verifyTaskStatusAccess(
        task,
        user
    );


    const updatedTask =
        await taskModel.toggleTaskStatus(
            taskId
        );


    await projectService.updateProjectProgress(
        updatedTask.project_id
    );


    return updatedTask;

};


module.exports = {

    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateTaskAssignment,
};