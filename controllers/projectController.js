const projectService = require("../services/projectService");
const projectMemberService = require("../services/projectMemberService");
const taskService = require("../services/taskService");
const commentService = require("../services/commentService");
const AppError = require("../utils/AppError");

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
    req.session.success = "Project created successfully.";
    return res.redirect("/manager/dashboard");
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
      req.user.user_id,
      req.body,
    );
    req.session.success = "Project updated successfully.";
    return res.redirect("/manager/dashboard");
  } catch (err) {
    next(err);
  }
};
const deleteProject = async (req, res, next) => {

    try {

        await projectService.deleteProject(
            req.params.id,
            req.user.user_id
        );

        req.session.success = "Project deleted successfully.";

        // AJAX request
        if (req.xhr) {

            return res.json({
                success: true,
                message: "Project deleted successfully."
            });

        }

        // Normal form submission
        return res.redirect("/manager/dashboard");

    } catch (err) {

        next(err);

    }

};

const viewProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const project = await projectService.getProjectById(projectId);
    const comments = await commentService.fetchProjectComments(projectId);
    if (req.user.role_name === "employee") {
      const isMember = await projectMemberService.isMember(
        projectId,
        req.user.user_id,
      );

      if (!isMember) {
        throw new AppError("You do not have access to this project.", 403);
      }
    }

    const tasks = await taskService.getTasksByProject(projectId, req.user);
    let projectMembers = [];

    if (req.user.role_name === "manager") {
      projectMembers = await projectMemberService.getMembers(
        projectId,
        req.user.user_id,
      );
    }

    return res.render("project", {
      title: project.project_name,
      project,
      tasks,
      projectMembers,
      comments,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Projects For Current User
 */
const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role_name === "employee") {
      projects = await projectService.getProjectsByMember(req.user.user_id);
    } else {
      projects = await projectService.getAllProjects();
    }

    return res.render("dashboard", {
      title: "Dashboard",
      projects,
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
  getProjects,
};
