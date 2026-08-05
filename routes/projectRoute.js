const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

const validate = require("../validators/validate");

const {
    createProjectSchema,
} = require("../validators/projectValidator");

// ===========================
// Create Project
// ===========================

router.post(
    "/",
    authMiddleware,
    validate(createProjectSchema),
    projectController.createProject
);
router.post(
    "/:id/update",
    authMiddleware,
    validate(createProjectSchema),
    projectController.updateProject
);
router.post(
    "/:id/delete",
    authMiddleware,
    projectController.deleteProject
);
router.get(
    "/:id",
    authMiddleware,
    projectController.viewProject
);
module.exports = router;