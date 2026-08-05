const taskService = require("../services/taskService");

/**
 * Create Task
 */
const createTask = async (req, res, next) => {

    try {

        await taskService.createTask({
            ...req.body,
            createdBy: req.user.user_id,
        });

        return res.redirect(`/projects/${req.body.projectId}`);

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
            req.body
        );

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

        const task = await taskService.deleteTask(req.params.id);

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

        const task = await taskService.toggleTaskStatus(req.params.id);

        return res.redirect(`/projects/${task.project_id}`);

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
};