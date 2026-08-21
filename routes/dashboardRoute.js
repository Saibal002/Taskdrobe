const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.get(
    "/dashboard",
    authMiddleware,
    requireRole(["admin", "manager", "employee"]),
    dashboardController.dashboard
);
// for testing role-based access control
router.get(
    "/dashboard/admin-test",
    authMiddleware,
    requireRole("admin"),
    (req, res) => {

        res.json({
            success: true,
            message: "Admin access granted.",
            user: {
                userId: req.user.user_id,
                name: req.user.full_name,
                role: req.user.role_name,
            },
        });

    }
);

module.exports = router;