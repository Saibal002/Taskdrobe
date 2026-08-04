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

module.exports = router;