const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const validate = require("../validators/validate");

const {
    createProjectSchema,
} = require("../validators/projectValidator");


// ===========================
// Create Project
// Manager + Admin
// ===========================

router.post(
    "/",
    authMiddleware,
    requireRole(["manager", "admin"]),
    validate(createProjectSchema),
    projectController.createProject
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
    projectController.updateProject
);


// ===========================
// Delete Project
// Manager + Admin
// ===========================

router.post(
    "/:id/delete",
    authMiddleware,
    requireRole(["manager", "admin"]),
    projectController.deleteProject
);


// ===========================
// View Project
// Authenticated users
// ===========================

router.get(
    "/:id",
    authMiddleware,
    projectController.viewProject
);


module.exports = router;