const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const taskController = require("../controllers/taskController");
const {
  uploadProjectDocument,
} = require("../middleware/documentUploadMiddleware");
const attachmentController = require("../controllers/attachmentController");

router.post("/", authMiddleware, taskController.createTask);

router.post("/:id/update", authMiddleware, taskController.updateTask);

router.post("/:id/delete", authMiddleware, taskController.deleteTask);

router.post("/:id/toggle", authMiddleware, taskController.toggleTaskStatus);

router.post("/:id/assign", authMiddleware, taskController.updateTaskAssignment);

// AJAX: Get tasks for a project
router.get(
  "/project/:projectId/data",
  authMiddleware,
  taskController.getProjectTasksData,
);
router.get("/:id/insight", authMiddleware, taskController.getTaskInsight);
// Add this route for file uploads
router.post(
  "/:taskId/files",
  authMiddleware,
  uploadProjectDocument.single("taskFile"),
  attachmentController.uploadTaskFile,
);
// Add this below your POST upload route
router.delete(
  "/files/:attachmentId",
  authMiddleware,
  attachmentController.deleteProjectFile,
);

// coomment
router.get("/:taskId/comments", authMiddleware, taskController.getTaskComments);
router.post("/:taskId/comments", authMiddleware, taskController.addTaskComment);
router.delete(
  "/comments/:commentId",
  authMiddleware,
  taskController.deleteTaskComment,
);

module.exports = router;
