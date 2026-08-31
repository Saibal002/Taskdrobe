const projectService = require("../services/projectService");
const projectMemberService = require("../services/projectMemberService");
const taskService = require("../services/taskService");
const commentService = require("../services/commentService");
const commentModel = require("../models/commentModel");
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



const addProjectComment = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { content, replyToId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "Comment cannot be empty." });
        }

        const savedComment = await commentModel.addComment({
            projectId,
            taskId: null,
            userId: req.user.user_id,
            content: content.trim(),
            replyToId: replyToId || null
        });

        const comments = await commentModel.getProjectComments(projectId);
        const fullComment = comments.find(c => String(c.comment_id) === String(savedComment.comment_id));

        return res.status(201).json({ success: true, comment: fullComment });
    } catch (err) {
        console.error("Add Project Comment Error:", err);
        return res.status(500).json({ success: false, message: "Failed to add comment." });
    }
};

const deleteProjectComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const deleted = await commentModel.deleteComment(commentId, req.user.user_id);
        
        if (deleted) {
            return res.json({ success: true, commentId });
        } else {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this comment." });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to delete comment." });
    }
};

// Don't forget to export these!
module.exports = {
  createProject,
  updateProject,
  deleteProject,
  viewProject,
  getProjects,
  addProjectComment,
  deleteProjectComment,
};
