const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");


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
// Teams Dashboard & Insights
// ===========================

// Render the Teams Dashboard Page
router.get("/teams", (req, res) => {
    // Generate a simple date string for the sidebar/navbar if needed
    const today = new Date().toLocaleDateString("en-US", { 
        weekday: 'short', month: 'short', day: 'numeric' 
    });

    res.render("teams/teams", {
        title: "Teams Directory",
        user: req.user,
        today: today
    });
});

// Render Single Team Insight Page
router.get("/teams/:teamId", (req, res) => {
    res.render("teams/team_insight", {
        title: "Team Insight",
        user: req.user,
        teamId: req.params.teamId
    });
});

module.exports = router;