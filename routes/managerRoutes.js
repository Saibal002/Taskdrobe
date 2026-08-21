const express = require("express");

const router = express.Router();

const dashboardController =
    require("../controllers/dashboardController");

const authMiddleware =
    require("../middleware/authMiddleware");

const requireRole =
    require("../middleware/roleMiddleware");


router.get(
    "/dashboard",
    authMiddleware,
    requireRole("manager"),
    dashboardController.managerDashboard
);


module.exports = router;