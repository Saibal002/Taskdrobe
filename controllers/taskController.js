
const taskService = require("../services/taskService");
const taskModel = require("../models/taskModel");
const projectService = require("../services/projectService");
const attachmentModel = require("../models/attachmentModel");
const commentModel = require("../models/commentModel");
const notificationModel = require("../models/notificationModel");


// =====================================================
// NOTIFICATION HELPER
// =====================================================

const triggerSystemAlert = async (
    req,
    targetUserId,
    type,
    referenceId,
    content
) => {

    // Do not notify yourself.
    if (
        !targetUserId ||
        String(targetUserId) ===
            String(req.user.user_id)
    ) {
        return;
    }

    try {

        // =================================================
        // 1. SAVE NOTIFICATION
        // =================================================

        const notification =
            await notificationModel.createNotification({
                userId: targetUserId,
                senderId: req.user.user_id,
                type,
                referenceId,
                content
            });


        // =================================================
        // 2. GET UNREAD COUNT
        // =================================================

        const unreadCount =
            await notificationModel.getUnreadCount(
                targetUserId
            );


        // =================================================
        // 3. GET NOTIFICATION SOCKET
        // =================================================

        const notificationIO =
            req.app.get("notificationIO");

        if (!notificationIO) {

            console.warn(
                "⚠️ Notification Socket.IO instance not available."
            );

            return;
        }


        // =================================================
        // 4. SEND REAL-TIME NOTIFICATION
        // =================================================

        notificationIO
            .to(`notification_user_${targetUserId}`)
            .emit(
                "newSystemNotification",
                notification
            );


        // =================================================
        // 5. UPDATE NOTIFICATION BADGE
        // =================================================

        notificationIO
            .to(`notification_user_${targetUserId}`)
            .emit(
                "notificationCountUpdated",
                unreadCount
            );

    } catch (err) {

        console.error(
            "❌ Failed to send system notification:",
            err
        );
    }
};


// =====================================================
// NOTIFY PROJECT MANAGER
// =====================================================

const notifyProjectManager = async (
    req,
    projectId,
    type,
    referenceId,
    content
) => {

    // Only employees trigger manager notifications.
    if (
        req.user.role_name !== "employee"
    ) {
        return;
    }

    try {

        const project =
            await projectService.getProjectById(
                projectId
            );


        if (!project) {

            console.warn(
                `⚠️ Cannot notify manager: project ${projectId} not found.`
            );

            return;
        }


        const managerId =
            project.created_by;


        if (!managerId) {

            console.warn(
                `⚠️ Cannot notify manager: project ${projectId} has no manager.`
            );

            return;
        }


        // Do not notify the employee themselves.
        if (
            String(managerId) ===
            String(req.user.user_id)
        ) {
            return;
        }


        await triggerSystemAlert(
            req,
            managerId,
            type,
            referenceId,
            content
        );

    } catch (err) {

        console.error(
            "❌ Manager notification error:",
            err
        );
    }
};


// =====================================================
// CREATE TASK
// =====================================================

const createTask = async (
    req,
    res,
    next
) => {

    try {

        // =================================================
        // TASK BUSINESS LOGIC
        // Controller → Service → Model
        // =================================================

        const task =
            await taskService.createTask(
                {
                    ...req.body,
                    createdBy:
                        req.user.user_id,
                },
                req.user
            );


        // =================================================
        // NOTIFY PROJECT MANAGER
        // =================================================

        await notifyProjectManager(
            req,
            task.project_id,
            "task_created",
            task.task_id,
            `${req.user.full_name} created task "${task.title}".`
        );


        // =================================================
        // RESPONSE
        // =================================================

        if (
            req.xhr ||
            (
                req.headers.accept &&
                req.headers.accept.includes(
                    "application/json"
                )
            )
        ) {

            return res.status(201).json({
                success: true,
                message:
                    "Task created successfully.",
                task
            });
        }


        req.session.success =
            "Task created successfully.";


        return res.redirect(
            `/projects/${task.project_id}`
        );

    } catch (err) {

        next(err);
    }
};


// =====================================================
// UPDATE TASK
// =====================================================

const updateTask = async (
    req,
    res,
    next
) => {

    try {

        // =================================================
        // TASK BUSINESS LOGIC
        // =================================================

        const task =
            await taskService.updateTask(
                req.params.id,
                req.body,
                req.user
            );


        // =================================================
        // NOTIFY ASSIGNEE
        // =================================================

        if (
            task.assigned_to &&
            String(task.assigned_to) !==
                String(req.user.user_id)
        ) {

            await triggerSystemAlert(
                req,
                task.assigned_to,
                "task_updated",
                task.task_id,
                `Task "${task.title}" was updated by ${req.user.full_name}.`
            );
        }


        // =================================================
        // NOTIFY PROJECT MANAGER
        // =================================================

        await notifyProjectManager(
            req,
            task.project_id,
            "task_updated",
            task.task_id,
            `${req.user.full_name} updated task "${task.title}".`
        );


        req.session.success =
            "Task updated successfully.";


        return res.redirect(
            `/projects/${task.project_id}`
        );

    } catch (err) {

        next(err);
    }
};


// =====================================================
// DELETE TASK
// =====================================================

const deleteTask = async (
    req,
    res,
    next
) => {

    try {

        // =================================================
        // TASK SERVICE HANDLES:
        // - existence
        // - permission
        // - deletion
        // - project progress
        // =================================================

        const task =
            await taskService.deleteTask(
                req.params.id,
                req.user
            );


        // =================================================
        // NOTIFY PROJECT MANAGER
        // =================================================

        await notifyProjectManager(
            req,
            task.project_id,
            "task_deleted",
            task.task_id,
            `${req.user.full_name} deleted task "${task.title}".`
        );


        req.session.success =
            "Task deleted successfully.";


        return res.redirect(
            `/projects/${task.project_id}`
        );

    } catch (err) {

        next(err);
    }
};


// =====================================================
// TOGGLE TASK STATUS
// =====================================================

const toggleTaskStatus = async (
    req,
    res,
    next
) => {

    try {

        // =================================================
        // TASK BUSINESS LOGIC
        // =================================================

        const task =
            await taskService.toggleTaskStatus(
                req.params.id,
                req.user
            );


        // =================================================
        // NOTIFY ASSIGNED EMPLOYEE
        // =================================================

        if (
            task.assigned_to &&
            String(task.assigned_to) !==
                String(req.user.user_id)
        ) {

            await triggerSystemAlert(
                req,
                task.assigned_to,
                "task_status",
                task.task_id,
                `Task "${task.title}" status updated to ${task.status}.`
            );
        }


        // =================================================
        // NOTIFY PROJECT MANAGER
        // =================================================

        await notifyProjectManager(
            req,
            task.project_id,
            "task_status",
            task.task_id,
            `Task "${task.title}" was marked as ${task.status} by ${req.user.full_name}.`
        );


        req.session.success =
            "Task status updated successfully.";


        return res.redirect(
            `/projects/${task.project_id}`
        );

    } catch (err) {

        next(err);
    }
};


// =====================================================
// ASSIGN / REASSIGN TASK
// =====================================================

const updateTaskAssignment = async (
    req,
    res,
    next
) => {

    try {

        const assignedTo =
            req.body.assignedTo;


        // =================================================
        // TASK SERVICE HANDLES:
        // - permission
        // - project membership
        // - assignment
        // =================================================

        const task =
            await taskService.updateTaskAssignment(
                req.params.id,
                assignedTo,
                req.user
            );


        // =================================================
        // NOTIFY NEW ASSIGNEE
        // =================================================

        await triggerSystemAlert(
            req,
            assignedTo,
            "task_assigned",
            task.task_id,
            "You were assigned a new task."
        );


        req.session.success =
            "Task assignment updated successfully.";


        return res.redirect(
            `/projects/${task.project_id}`
        );

    } catch (err) {

        next(err);
    }
};


// =====================================================
// GET TASKS BY PROJECT
// =====================================================

const getProjectTasksData = async (
    req,
    res,
    next
) => {

    try {

        const {
            projectId
        } = req.params;


        const tasks =
            await taskService.getTasksByProject(
                projectId,
                req.user
            );


        return res.json({
            success: true,
            tasks
        });

    } catch (err) {

        next(err);
    }
};


// =====================================================
// TASK INSIGHT
// =====================================================

const getTaskInsight = async (
    req,
    res,
    next
) => {

    try {

        const taskId =
            req.params.id;


        const task =
            await taskModel.getTaskInsightData(
                taskId
            );


        if (!task) {

            return res.status(404).render(
                "error",
                {
                    message:
                        "Task not found"
                }
            );
        }


        const files =
            await attachmentModel.getTaskAttachments(
                taskId
            );


        const comments =
            await commentModel.getTaskComments(
                taskId
            );


        return res.render(
            "task-insight",
            {
                title:
                    `Task Insight: ${task.title}`,
                task,
                files,
                comments,
                user: req.user
            }
        );

    } catch (err) {

        next(err);
    }
};


// =====================================================
// GET TASK COMMENTS
// =====================================================

const getTaskComments = async (
    req,
    res,
    next
) => {

    try {

        const taskId =
            req.params.taskId;


        const comments =
            await commentModel.getTaskComments(
                taskId
            );


        return res.json({
            success: true,
            comments
        });

    } catch (err) {

        next(err);
    }
};


// =====================================================
// ADD TASK COMMENT
// =====================================================

const addTaskComment = async (
    req,
    res,
    next
) => {

    try {

        const taskId =
            req.params.taskId;


        const {
            content,
            replyToId
        } = req.body;


        if (
            !content ||
            !content.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be empty."
            });
        }


        // =================================================
        // GET TASK
        // =================================================

        const task =
            await taskModel.getTaskInsightData(
                taskId
            );


        if (!task) {

            return res.status(404).json({
                success: false,
                message:
                    "Task not found."
            });
        }


        const projectId =
            task.project_id;


        // =================================================
        // SAVE COMMENT
        // =================================================

        const savedComment =
            await commentModel.addComment({
                projectId,
                taskId,
                userId:
                    req.user.user_id,
                content:
                    content.trim(),
                replyToId:
                    replyToId || null
            });


        // =================================================
        // GET FULL COMMENT
        // =================================================

        const comments =
            await commentModel.getTaskComments(
                taskId
            );


        const fullComment =
            comments.find(
                comment =>
                    String(
                        comment.comment_id
                    ) ===
                    String(
                        savedComment.comment_id
                    )
            );


        if (!fullComment) {

            return res.status(500).json({
                success: false,
                message:
                    "Comment was saved but could not be loaded."
            });
        }


        // =================================================
        // NOTIFY COMMENT RECIPIENTS
        // =================================================

        if (replyToId) {

            const parentComment =
                comments.find(
                    comment =>
                        String(
                            comment.comment_id
                        ) ===
                        String(replyToId)
                );


            if (
                parentComment &&
                String(
                    parentComment.user_id
                ) !==
                    String(req.user.user_id)
            ) {

                await triggerSystemAlert(
                    req,
                    parentComment.user_id,
                    "task_comment",
                    taskId,
                    `${req.user.full_name} replied to your task comment.`
                );
            }

        } else {

            // Notify task creator.
            if (
                task.created_by &&
                String(task.created_by) !==
                    String(req.user.user_id)
            ) {

                await triggerSystemAlert(
                    req,
                    task.created_by,
                    "task_comment",
                    taskId,
                    `${req.user.full_name} commented on task "${task.title}".`
                );
            }


            // Notify assigned employee.
            if (
                task.assigned_to &&
                String(task.assigned_to) !==
                    String(req.user.user_id) &&
                String(task.assigned_to) !==
                    String(task.created_by)
            ) {

                await triggerSystemAlert(
                    req,
                    task.assigned_to,
                    "task_comment",
                    taskId,
                    `${req.user.full_name} commented on your assigned task "${task.title}".`
                );
            }


            // Notify project manager when an employee comments.
            await notifyProjectManager(
                req,
                projectId,
                "task_comment",
                taskId,
                `${req.user.full_name} commented on task "${task.title}".`
            );
        }


        return res.status(201).json({
            success: true,
            comment: fullComment
        });

    } catch (err) {

        next(err);
    }
};


// =====================================================
// DELETE TASK COMMENT
// =====================================================

const deleteTaskComment = async (
    req,
    res
) => {

    try {

        const commentId =
            req.params.commentId;


        const userId =
            req.user.user_id;


        const deleted =
            await commentModel.deleteComment(
                commentId,
                userId
            );


        if (deleted) {

            return res.json({
                success: true,
                commentId
            });

        }


        return res.status(403).json({
            success: false,
            message:
                "Unauthorized to delete this comment."
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete comment."
        });
    }
};
// =====================================================
// VIEW ALL TASKS (Unified RBAC)
// =====================================================

const getTasks = async (req, res, next) => {
    try {
        let tasks = [];

        if (req.user.role_name === "admin") {
            tasks = await taskService.getAllTasks();
        } else if (req.user.role_name === "manager") {
            tasks = await taskService.getTasksByManager(req.user.user_id);
        } else if (req.user.role_name === "employee") {
            tasks = await taskService.getTasksByEmployeeProjects(req.user.user_id);
        }

        return res.render("tasks", {
            title: "All Tasks",
            tasks,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateTaskAssignment,
    getProjectTasksData,
    getTaskInsight,
    getTaskComments,
    addTaskComment,
    deleteTaskComment,
    getTasks,
};

