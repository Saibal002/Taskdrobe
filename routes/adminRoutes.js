const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const AdminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// Ensure every single route in this file requires Admin privileges
router.use(authMiddleware, requireRole("admin"));

// 1. Dashboard View
router.get("/dashboard", dashboardController.adminDashboard);

// 2. User Management Views & AJAX
router.get("/users", AdminController.renderUserManagement);
router.post("/users/create", AdminController.adminCreateUser);

// 3. Team "God Mode" AJAX Overrides
router.get("/teams", AdminController.getAllTeams);
router.get("/teams/:teamId", AdminController.getTeamDetails);
router.delete("/teams/:teamId", AdminController.forceDeleteTeam);

router.put("/users/:userId", AdminController.adminUpdateUser);
router.delete("/users/:userId", AdminController.adminDeleteUser);

module.exports = router;