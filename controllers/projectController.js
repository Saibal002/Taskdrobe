const projectService = require("../services/projectService");
const taskService = require("../services/taskService");
const commentService = require("../services/commentService");
const commentModel = require("../models/commentModel");
const notificationModel = require("../models/notificationModel");
const projectModel = require("../models/projectModel");
const teamModel = require("../models/teamModel");
const AppError = require("../utils/AppError");
const ActivityService = require("../services/activityService"); // INJECTED LOGGER

const sendProjectNotification = async (req, targetUserId, type, referenceId, content) => {
    if (!targetUserId || String(targetUserId) === String(req.user.user_id)) return;
    try {
        const notification = await notificationModel.createNotification({
            userId: targetUserId, senderId: req.user.user_id, type, referenceId, content
        });
        const unreadCount = await notificationModel.getUnreadCount(targetUserId);
        const notificationIO = req.app.get("notificationIO");
        if (!notificationIO) return;

        const room = `notification_user_${targetUserId}`;
        notificationIO.to(room).emit("newSystemNotification", notification);
        notificationIO.to(room).emit("notificationCountUpdated", unreadCount);
    } catch (err) {
        console.error("Project notification error:", err.message);
    }
};

const notifyProjectMembers = async (req, projectId, type, referenceId, content, extraUserIds = []) => {
    try {
        const project = await projectModel.getProjectById(projectId);
        if (!project) return;
        const teamMembers = await teamModel.findTeamMembers(project.team_id);
        const memberIds = teamMembers.map(m => m.user_id);

        const allCandidates = [...memberIds, project.created_by, ...extraUserIds];
        const recipients = allCandidates
            .map(id => String(id))
            .filter((id, index, array) => array.indexOf(id) === index)
            .filter(id => id !== String(req.user.user_id));

        for (const userId of recipients) {
            await sendProjectNotification(req, userId, type, referenceId, content);
        }
    } catch (err) {
        console.error("Project member notification error:", err.message);
    }
};

const createProject = async (req, res, next) => {
  try {
    const { teamId, projectName, description, deadline, status, progress } = req.body;
    const project = await projectService.createProject({
      teamId, projectName, description, deadline, status, progress, createdBy: req.user.user_id,
    });

    ActivityService.log({
        userId: req.user.user_id, action: "CREATE", entityType: "Project", entityId: project.project_id,
        description: `Created project: ${project.project_name}`
    }).catch(err => console.error(err));

    if (req.body.tasks) {
      const tasks = Array.isArray(req.body.tasks) ? req.body.tasks : [req.body.tasks];
      for (const taskTitle of tasks) {
        if (taskTitle.trim() !== "") {
          try {
            await taskService.createTask({ projectId: project.project_id, title: taskTitle.trim(), assignedTo: null }, req.user);
          } catch (err) {
            console.error(`Failed to create task ${taskTitle}:`, err.message);
          }
        }
      }
    }
    req.session.success = "Project created successfully.";
    return res.redirect("/manager/dashboard");
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
    try {
        const managerIdToUse = req.user.role_name === 'admin' ? (await projectService.getProjectById(req.params.id)).created_by : req.user.user_id;
        const project = await projectService.updateProject(req.params.id, managerIdToUse, req.body);
        
        ActivityService.log({
            userId: req.user.user_id, action: "UPDATE", entityType: "Project", entityId: project.project_id,
            description: `Updated project: ${project.project_name}`
        }).catch(err => console.error(err));

        await notifyProjectMembers(req, project.project_id, "project_updated", project.project_id, `Project "${project.project_name}" was updated.`);
        req.session.success = "Project updated successfully.";
        return res.redirect("/manager/dashboard");
    } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await projectService.getProjectById(projectId);
        if (!project) throw new AppError("Project not found.", 404);

        const teamMembers = await teamModel.findTeamMembers(project.team_id);
        const memberIds = teamMembers.map(m => m.user_id);

        // FIX: If Admin, fake the manager ID so the SQL query succeeds
        const managerIdToUse = req.user.role_name === 'admin' ? project.created_by : req.user.user_id;
        await projectService.deleteProject(projectId, managerIdToUse);

        ActivityService.log({
            userId: req.user.user_id, action: "DELETE", entityType: "Project", entityId: projectId,
            description: `Deleted project: ${project.project_name}`
        }).catch(err => console.error(err));

        for (const userId of memberIds) {
            await sendProjectNotification(req, userId, "project_deleted", projectId, `Project "${project.project_name}" was deleted.`);
        }

        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            return res.json({ success: true, message: "Project deleted successfully." });
        }
        
        req.session.success = "Project deleted successfully.";
        return res.redirect("/manager/dashboard");
    } catch (err) { next(err); }
};

const viewProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await projectService.getProjectById(projectId);
    const comments = await commentService.fetchProjectComments(projectId);
    
    if (req.user.role_name === "employee") {
      const isMember = await teamModel.isMember(project.team_id, req.user.user_id);
      if (!isMember) throw new AppError("You do not have access to this project.", 403);
    }
    const tasks = await taskService.getTasksByProject(projectId, req.user);
    const projectMembers = await teamModel.findTeamMembers(project.team_id);

    return res.render("project", { title: project.project_name, project, tasks, projectMembers, comments, user: req.user });
  } catch (err) { next(err); }
};

const getProjects = async (req, res, next) => {
  try {
    let projects = [];
    if (req.user.role_name === "admin") projects = await projectService.getAllProjects();
    else if (req.user.role_name === "manager") projects = await projectService.getProjectsByManager(req.user.user_id);
    else if (req.user.role_name === "employee") projects = await projectService.getProjectsByMember(req.user.user_id);

    return res.render("projects", { title: "All Projects", projects, user: req.user });
  } catch (err) { next(err); }
};

const getProjectComments = async (req, res, next) => {
    try {
        const comments = await commentModel.getProjectComments(req.params.projectId);
        return res.json({ success: true, comments });
    } catch (err) { next(err); }
};

const addProjectComment = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const { content, replyToId } = req.body;
        if (!content || !content.trim()) return res.status(400).json({ success: false, message: "Comment cannot be empty." });

        const savedComment = await commentModel.addComment({
            projectId, taskId: null, userId: req.user.user_id, content: content.trim(), replyToId: replyToId || null
        });

        const comments = await commentModel.getProjectComments(projectId);
        const fullComment = comments.find(c => String(c.comment_id) === String(savedComment.comment_id));
        if (!fullComment) return res.status(500).json({ success: false, message: "Comment was saved but could not be loaded." });

        if (replyToId) {
            const parentComment = comments.find(c => String(c.comment_id) === String(replyToId));
            if (parentComment && String(parentComment.user_id) !== String(req.user.user_id)) {
                await sendProjectNotification(req, parentComment.user_id, "project_comment", projectId, `${req.user.full_name} replied to your project comment.`);
            }
        } else {
            await notifyProjectMembers(req, projectId, "project_comment", projectId, `${req.user.full_name} commented on a project.`);
        }
        return res.status(201).json({ success: true, comment: fullComment });
    } catch (err) { next(err); }
};

const deleteProjectComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const deleted = await commentModel.deleteComment(commentId, req.user.user_id);
        if (deleted) return res.json({ success: true, commentId });
        return res.status(403).json({ success: false, message: "Unauthorized to delete this comment." });
    } catch (err) { return res.status(500).json({ success: false, message: "Failed to delete comment." }); }
};

module.exports = { createProject, updateProject, deleteProject, viewProject, getProjects, getProjectComments, addProjectComment, deleteProjectComment };