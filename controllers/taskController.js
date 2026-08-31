const taskService = require("../services/taskService");
const taskModel = require("../models/taskModel");
const attachmentModel = require("../models/attachmentModel");
const commentModel = require("../models/commentModel");
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
    const task = await taskService.updateTaskAssignment(
      req.params.id,
      req.body.assignedTo,
      req.user,
    );

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

    return res.json({
      success: true,
      tasks,
    });
  } catch (err) {
    next(err);
  }
};
const getTaskInsight = async (req, res, next) => {
    try {
        const taskId = req.params.id; // Using your existing :id structure
        
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

const addTaskComment = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const { projectId, content, replyToId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "Comment cannot be empty." });
        }

        const savedComment = await commentModel.addComment({
            projectId,
            taskId,
            userId: req.user.user_id,
            content: content.trim(),
            replyToId: replyToId || null
        });

        // Fetch the full payload so we get the user's name and avatar for the UI
        const comments = await commentModel.getTaskComments(taskId);
        const fullComment = comments.find(c => String(c.comment_id) === String(savedComment.comment_id));

        return res.status(201).json({ success: true, comment: fullComment });
    } catch (err) {
        console.error("Add Comment Error:", err);
        return res.status(500).json({ success: false, message: "Failed to add comment." });
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
        console.error("Delete Comment Error:", err);
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
  addTaskComment,
  deleteTaskComment,
};
