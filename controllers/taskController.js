const taskService = require("../services/taskService");

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

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  updateTaskAssignment,
  getProjectTasksData,
};
