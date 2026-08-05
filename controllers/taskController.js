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

module.exports = {
    createTask,
};