const express = require("express");

const router = express.Router();

const dashboardController =
    require("../controllers/dashboardController");

const projectMemberController =
    require("../controllers/projectMemberController");

const authMiddleware =
    require("../middleware/authMiddleware");

const requireRole =
    require("../middleware/roleMiddleware");


// ===========================
// Manager Dashboard
// ===========================

router.get(
    "/dashboard",
    authMiddleware,
    requireRole("manager"),
    dashboardController.managerDashboard
);


// ===========================
// Project Members
// ===========================

// View members
router.get(
    "/projects/:projectId/members",
    authMiddleware,
    requireRole("manager"),
    projectMemberController.getMembers
);


// Add employee
router.post(
    "/projects/:projectId/members",
    authMiddleware,
    requireRole("manager"),
    projectMemberController.addMember
);


// Remove employee
router.post(
    "/projects/:projectId/members/:userId/remove",
    authMiddleware,
    requireRole("manager"),
    projectMemberController.removeMember
);


module.exports = router;