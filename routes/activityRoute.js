const express = require("express");

const router = express.Router();

const activityController = require("../controllers/activityController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.get(
    "/recent",
    authMiddleware,
    requireRole(["manager"]),
    activityController.getRecentActivity
);

module.exports = router;