const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const validate = require("../validators/validate");
const attachmentController = require("../controllers/attachmentController");
const {
  uploadProjectDocument,
} = require("../middleware/documentUploadMiddleware");

const { createProjectSchema } = require("../validators/projectValidator");

// ===========================
// Create Project
// Manager + Admin
// ===========================

router.post(
  "/",
  authMiddleware,
  requireRole(["manager", "admin"]),
  validate(createProjectSchema),
  projectController.createProject,
);

// ===========================
// Update Project
// Manager + Admin
// ===========================

router.post(
  "/:id/update",
  authMiddleware,
  requireRole(["manager", "admin"]),
  validate(createProjectSchema),
  projectController.updateProject,
);

// ===========================
// Delete Project
// Manager + Admin
// ===========================

router.post(
  "/:id/delete",
  authMiddleware,
  requireRole(["manager", "admin"]),
  projectController.deleteProject,
);

// ===========================
// View All Projects (Unified RBAC)
// Authenticated users
// ===========================
router.get(
  "/",
  authMiddleware,
  projectController.getProjects
);

// ===========================
// View Project
// Authenticated users
// ===========================

router.get("/:id", authMiddleware, projectController.viewProject);

// Add these to your existing project routes:
router.get(
  "/:projectId/files/data",
  authMiddleware,
  attachmentController.getProjectFiles,
);

router.post(
  "/:projectId/files",
  authMiddleware,
  uploadProjectDocument.single("projectFile"),
  attachmentController.uploadProjectFile,
);

router.delete(
  "/files/:attachmentId",
  authMiddleware,
  attachmentController.deleteProjectFile,
);

router.get(
  "/:projectId/comments",
  authMiddleware,
  projectController.getProjectComments,
);
router.post(
  "/:projectId/comments",
  authMiddleware,
  projectController.addProjectComment,
);
router.delete(
  "/comments/:commentId",
  authMiddleware,
  projectController.deleteProjectComment,
);
module.exports = router;
