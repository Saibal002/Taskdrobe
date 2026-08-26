const express = require("express");

const router = express.Router();

const projectMemberController = require("../controllers/projectMemberController");

const authMiddleware = require("../middleware/authMiddleware");

const requireRole = require("../middleware/roleMiddleware");


// Add employee to project
router.post(
    "/projects/:projectId/members",
    authMiddleware,
    requireRole("manager"),
    projectMemberController.addMember
);


// Get project members
router.get(
    "/projects/:projectId/members",
    authMiddleware,
    requireRole(["manager", "admin"]),
    projectMemberController.getMembers
);

// AJAX: Get project members as JSON
router.get(
    "/projects/:projectId/members/data",
    authMiddleware,
    requireRole(["manager", "admin"]),
    projectMemberController.getMembersData
);


// Remove employee from project
router.delete(
    "/projects/:projectId/members/:userId",
    authMiddleware,
    requireRole("manager"),
    projectMemberController.removeMember
);


module.exports = router;