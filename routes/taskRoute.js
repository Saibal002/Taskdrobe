const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const taskController = require("../controllers/taskController");

router.post("/", authMiddleware, taskController.createTask);

router.post("/:id/update", authMiddleware, taskController.updateTask);

router.post("/:id/delete", authMiddleware, taskController.deleteTask);

router.post("/:id/toggle", authMiddleware, taskController.toggleTaskStatus);

module.exports = router;