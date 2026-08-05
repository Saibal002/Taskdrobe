const projectService = require("../services/projectService");
const taskService = require("../services/taskService");

/**
 * Create Project
 */
const createProject = async (req, res, next) => {

    try {

        console.log(req.user);

        const project = await projectService.createProject({
            ...req.body,
            createdBy: req.user.user_id,
        });

        return res.redirect("/dashboard");

    } catch (err) {

        next(err);

    }

};
/**
 * Update Project
 */
const updateProject = async (req, res, next) => {

    try {

        await projectService.updateProject(
            req.params.id,
            req.body
        );

        return res.redirect("/dashboard");

    } catch (err) {

        next(err);

    }

};
const deleteProject = async (req, res, next) => {

    try {

        await projectService.deleteProject(req.params.id);

        return res.redirect("/dashboard");

    } catch (err) {

        next(err);

    }

};
const viewProject = async (req, res, next) => {

    try {

        const project = await projectService.getProjectById(req.params.id);

        const tasks = await taskService.getTasksByProject(
            req.params.id
        );

        return res.render("project", {

            title: project.project_name,

            project,

            tasks,

            user: req.user,

        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createProject,
    updateProject,
    deleteProject,
    viewProject,
};