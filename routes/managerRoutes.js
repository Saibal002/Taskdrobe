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

// Render the Teams Dashboard Page
router.get("/teams", (req, res) => {
    // Generate a simple date string for the sidebar/navbar if needed
    const today = new Date().toLocaleDateString("en-US", { 
        weekday: 'short', month: 'short', day: 'numeric' 
    });

    res.render("manager/teams", {
        title: "Teams Directory",
        user: req.user,
        today: today
    });
});

// Render Single Team Insight Page
router.get("/teams/:teamId", (req, res) => {
    res.render("manager/team_insight", {
        title: "Team Insight",
        user: req.user,
        teamId: req.params.teamId
    });
});
module.exports = router;