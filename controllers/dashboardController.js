const projectService = require("../services/projectService");

const dashboard = async (req, res, next) => {

    try {

        const projects = await projectService.getAllProjects();

        res.render("dashboard", {
            title: "Dashboard",

            user: req.user,

            today: new Date().toDateString(),

            projects,
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    dashboard,
};