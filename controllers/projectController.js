const projectService = require("../services/projectService");
const projectMemberService = require("../services/projectMemberService");
const taskService = require("../services/taskService");
const commentService = require("../services/commentService");
const commentModel = require("../models/commentModel");


const notificationModel =
    require("../models/notificationModel");
    const projectMemberModel =
    require("../models/projectMemberModel");
const AppError = require("../utils/AppError");

//HELPERS======================

const sendProjectNotification = async (
    req,
    targetUserId,
    type,
    referenceId,
    content
) => {

    if (
        !targetUserId ||
        String(targetUserId) ===
            String(req.user.user_id)
    ) {
        return;
    }

    try {

        const notification =
            await notificationModel.createNotification({
                userId: targetUserId,
                senderId: req.user.user_id,
                type,
                referenceId,
                content
            });

        const unreadCount =
            await notificationModel.getUnreadCount(
                targetUserId
            );

        const notificationIO =
            req.app.get("notificationIO");

        if (!notificationIO) {
            return;
        }

        const room =
            `notification_user_${targetUserId}`;

        notificationIO
            .to(room)
            .emit(
                "newSystemNotification",
                notification
            );

        notificationIO
            .to(room)
            .emit(
                "notificationCountUpdated",
                unreadCount
            );

    } catch (err) {

        console.error(
            "Project notification error:",
            err.message
        );
    }
};

const notifyProjectMembers = async (
    req,
    projectId,
    type,
    referenceId,
    content,
    extraUserIds = []
) => {
    try {
        const project = await projectModel.getProjectById(projectId);
        const memberIds = await projectMemberModel.getProjectMemberIds(projectId);

        // Explicitly include the manager (created_by) in the notification pool
        const allCandidates = [
            ...memberIds,
            ...(project ? [project.created_by] : []),
            ...extraUserIds
        ];

        const recipients = allCandidates
            .map(id => String(id))
            .filter((id, index, array) => array.indexOf(id) === index) // Remove duplicates
            .filter(id => id !== String(req.user.user_id)); // Don't notify the sender

        for (const userId of recipients) {
            await sendProjectNotification(
                req,
                userId,
                type,
                referenceId,
                content
            );
        }
    } catch (err) {
        console.error("Project member notification error:", err.message);
    }
};
//========================


/**
 * Create Project
 */
const createProject = async (req, res, next) => {
  try {
    const { 
        teamId, 
        projectName, 
        description, 
        deadline, 
        status, 
        progress 
    } = req.body;

    // 1. Create the base project bound to the team
    const project = await projectService.createProject({
      teamId,
      projectName,
      description,
      deadline,
      status,
      progress,
      createdBy: req.user.user_id,
    });

    // 2. Automatically generate the quick-added tasks
    if (req.body.tasks) {
      const tasks = Array.isArray(req.body.tasks) 
          ? req.body.tasks 
          : [req.body.tasks];

      for (const taskTitle of tasks) {
        if (taskTitle.trim() !== "") {
          try {
            await taskService.createTask({
              projectId: project.project_id,
              title: taskTitle.trim(),
              assignedTo: null 
            }, req.user);
          } catch (err) {
            console.error(`Failed to create task ${taskTitle}:`, err.message);
          }
        }
      }
    }

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

        const project =
            await projectService.updateProject(
                req.params.id,
                req.user.user_id,
                req.body
            );

        await notifyProjectMembers(
            req,
            project.project_id,
            "project_updated",
            project.project_id,
            `Project "${project.project_name}" was updated.`
        );

        req.session.success =
            "Project updated successfully.";

        return res.redirect(
            "/manager/dashboard"
        );

    } catch (err) {

        next(err);
    }
};

const deleteProject = async (req, res, next) => {
    try {

        const projectId = req.params.id;

        // =====================================================
        // 1. GET PROJECT BEFORE DELETION
        // =====================================================

        const project =
            await projectService.getProjectById(projectId);

        if (!project) {
            throw new AppError(
                "Project not found.",
                404
            );
        }

        // =====================================================
        // 2. CAPTURE MEMBERS BEFORE DELETION
        // =====================================================

        const memberIds =
            await projectMemberModel.getProjectMemberIds(
                projectId
            );

            

        // =====================================================
        // 3. DELETE PROJECT
        // =====================================================

        await projectService.deleteProject(
            projectId,
            req.user.user_id
        );

        // =====================================================
        // 4. NOTIFY FORMER PROJECT MEMBERS
        // =====================================================

        for (const userId of memberIds) {

            await sendProjectNotification(
                req,
                userId,
                "project_deleted",
                projectId,
                `Project "${project.project_name}" was deleted.`
            );
        }

        // =====================================================
        // 5. EXISTING SUCCESS MESSAGE
        // =====================================================

        req.session.success =
            "Project deleted successfully.";

        // =====================================================
        // 6. EXISTING AJAX RESPONSE
        // =====================================================

        if (req.xhr) {

            return res.json({
                success: true,
                message:
                    "Project deleted successfully."
            });
        }

        return res.redirect(
            "/manager/dashboard"
        );

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


const getProjectComments = async (req, res, next) => {
    try {

        const projectId =
            req.params.projectId;

        const comments =
            await commentModel.getProjectComments(
                projectId
            );

        return res.json({
            success: true,
            comments
        });

    } catch (err) {

        next(err);

    }
};

const addProjectComment = async (req, res, next) => {
    try {

        const projectId = req.params.projectId;

        const {
            content,
            replyToId
        } = req.body;

        // =====================================================
        // 1. VALIDATE COMMENT
        // =====================================================

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty."
            });
        }


        // =====================================================
        // 2. SAVE COMMENT
        // =====================================================

        const savedComment =
            await commentModel.addComment({
                projectId,
                taskId: null,
                userId: req.user.user_id,
                content: content.trim(),
                replyToId: replyToId || null
            });


        // =====================================================
        // 3. GET RICH COMMENT DATA
        // =====================================================

        const comments =
            await commentModel.getProjectComments(
                projectId
            );

        const fullComment =
            comments.find(
                comment =>
                    String(comment.comment_id) ===
                    String(savedComment.comment_id)
            );


        if (!fullComment) {

            return res.status(500).json({
                success: false,
                message:
                    "Comment was saved but could not be loaded."
            });
        }


        // =====================================================
        // 4. SYSTEM NOTIFICATION
        // =====================================================

        if (replyToId) {

            // -------------------------------------------------
            // REPLY
            // -------------------------------------------------

            const parentComment =
                comments.find(
                    comment =>
                        String(comment.comment_id) ===
                        String(replyToId)
                );


            if (
                parentComment &&
                String(parentComment.user_id) !==
                    String(req.user.user_id)
            ) {

                await sendProjectNotification(
                    req,
                    parentComment.user_id,
                    "project_comment",
                    projectId,
                    `${req.user.full_name} replied to your project comment.`
                );
            }

        } else {

            // -------------------------------------------------
            // NORMAL PROJECT COMMENT
            // -------------------------------------------------

            await notifyProjectMembers(
                req,
                projectId,
                "project_comment",
                projectId,
                `${req.user.full_name} commented on a project.`
            );
        }


        // =====================================================
        // 5. RETURN COMMENT
        // =====================================================

        return res.status(201).json({
            success: true,
            comment: fullComment
        });

    } catch (err) {

        next(err);
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
  getProjectComments,
  addProjectComment,
  deleteProjectComment,
};
