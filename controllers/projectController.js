const projectService = require("../services/projectService");

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

module.exports = {
    createProject,
};