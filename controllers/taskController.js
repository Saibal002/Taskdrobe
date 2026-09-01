const taskService = require("../services/taskService");
const taskModel = require("../models/taskModel");
const attachmentModel = require("../models/attachmentModel");
const commentModel = require("../models/commentModel");
const notificationModel = require("../models/notificationModel");

// Helper to fire real-time alerts
const triggerSystemAlert = async (
    req,
    targetUserId,
    type,
    referenceId,
    content
) => {

    // Don't notify yourself.
    if (
        !targetUserId ||
        String(targetUserId) === String(req.user.user_id)
    ) {
        return;
    }

    try {

        // =====================================================
        // 1. SAVE SYSTEM NOTIFICATION
        // =====================================================

        const notification =
            await notificationModel.createNotification({
                userId: targetUserId,
                senderId: req.user.user_id,
                type,
                referenceId,
                content
            });


        // =====================================================
        // 2. GET UNREAD SYSTEM NOTIFICATION COUNT
        // =====================================================

        const unreadCount =
            await notificationModel.getUnreadCount(
                targetUserId
            );


        // =====================================================
        // 3. USE NOTIFICATION NAMESPACE
        // =====================================================

        const notificationIO =
            req.app.get("notificationIO");

        if (!notificationIO) {
            console.warn(
                "⚠️ Notification Socket.IO instance not available."
            );
            return;
        }


        // =====================================================
        // 4. SEND NOTIFICATION TO USER
        // =====================================================

        notificationIO
            .to(`notification_user_${targetUserId}`)
            .emit(
                "newSystemNotification",
                notification
            );


        // =====================================================
        // 5. UPDATE BADGE
        // =====================================================

        notificationIO
            .to(`notification_user_${targetUserId}`)
            .emit(
                "notificationCountUpdated",
                unreadCount
            );

    } catch (err) {

        console.error(
            "Failed to send system notification:",
            err.message
        );
    }
};
/**
 * Create Task
 */
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(
      {
        ...req.body,
        createdBy: req.user.user_id,
      },
      req.user,
    );
    if (
      req.xhr ||
      (req.headers.accept && req.headers.accept.includes("application/json"))
    ) {
      return res.status(201).json({
        success: true,
        message: "Task created successfully.",
        task,
      });
    }

    req.session.success = "Task created successfully.";
    return res.redirect(`/projects/${task.project_id}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Update Task
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user,
    );
    req.session.success = "Task updated successfully.";
    return res.redirect(`/projects/${task.project_id}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Task
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await taskService.deleteTask(req.params.id, req.user);
    req.session.success = "Task deleted successfully.";
    return res.redirect(`/projects/${task.project_id}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle Status
 */
const toggleTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.toggleTaskStatus(req.params.id, req.user);

    // NOTIFY: The person assigned to this task that the status changed
    await triggerSystemAlert(req, task.assigned_to, 'task_status', task.task_id, `Task status updated to ${task.status}`);

    req.session.success = "Task status updated successfully.";
    return res.redirect(`/projects/${task.project_id}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Assign / Reassign Task
 */
const updateTaskAssignment = async (req, res, next) => {
  try {
    const assignedTo = req.body.assignedTo;
    const task = await taskService.updateTaskAssignment(
      req.params.id,
      assignedTo,
      req.user,
    );

    // NOTIFY: The person who just got assigned the task
    await triggerSystemAlert(req, assignedTo, 'task_assigned', task.task_id, `You were assigned a new task.`);

    req.session.success = "Task assignment updated successfully.";
    return res.redirect(`/projects/${task.project_id}`);
  } catch (err) {
    next(err);
  }
};

/**
 * AJAX: Get Tasks By Project
 */
const getProjectTasksData = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const tasks = await taskService.getTasksByProject(projectId, req.user);
    return res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

const getTaskInsight = async (req, res, next) => {
    try {
        const taskId = req.params.id; 
        const task = await taskModel.getTaskInsightData(taskId);
        if (!task) {
            return res.status(404).render("error", { message: "Task not found" });
        }

        const files = await attachmentModel.getTaskAttachments(taskId);
        const comments = await commentModel.getTaskComments(taskId);

        res.render("task-insight", {
            title: `Task Insight: ${task.title}`,
            task,
            files,
            comments,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};
const getTaskComments = async (req, res, next) => {
    try {

        const taskId = req.params.taskId;

        const comments =
            await commentModel.getTaskComments(taskId);

        return res.json({
            success: true,
            comments
        });

    } catch (err) {

        next(err);

    }
};

const addTaskComment = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const {
            content,
            replyToId
        } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty."
            });
        }

        // Get the task so we know its project_id.
        const task =
            await taskModel.getTaskInsightData(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const projectId = task.project_id;

        const savedComment =
            await commentModel.addComment({
                projectId,
                taskId,
                userId: req.user.user_id,
                content: content.trim(),
                replyToId: replyToId || null
            });

        const comments =
            await commentModel.getTaskComments(taskId);

        const fullComment =
            comments.find(
                comment =>
                    String(comment.comment_id) ===
                    String(savedComment.comment_id)
            );

        if (!fullComment) {
            return res.status(500).json({
                success: false,
                message:
                    "Comment was saved but could not be loaded."
            });
        }

        // Notify the author of the parent comment when this is a reply.
        if (replyToId) {

            const parentComment =
                comments.find(
                    comment =>
                        String(comment.comment_id) ===
                        String(replyToId)
                );

            if (
                parentComment &&
                String(parentComment.user_id) !==
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
        }

        return res.status(201).json({
            success: true,
            comment: fullComment
        });

    } catch (err) {
        next(err);
    }
};
const deleteTaskComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.user_id;

        const deleted = await commentModel.deleteComment(commentId, userId);
        
        if (deleted) {
            return res.json({ success: true, commentId });
        } else {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this comment." });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to delete comment." });
    }
};

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
};