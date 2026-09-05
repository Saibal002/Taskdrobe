const express = require("express");

const TeamController = require("../controllers/teamController");
const requireRole = require("../middleware/roleMiddleware");
const validate = require("../validators/validate");

const {
    createTeamValidator,
    updateTeamValidator,
    teamIdValidator,
    addTeamMemberValidator,
    removeTeamMemberValidator
} = require("../validators/teamValidator");

const router = express.Router();

// =====================================================
// Manager Routes
// =====================================================

// 1. Create team
router.post(
    "/",
    requireRole("manager"),
    validate(createTeamValidator),
    TeamController.createTeam
);

// 2. Static routes MUST come before dynamic /:teamId routes
router.get(
    "/manager",
    requireRole("manager"),
    TeamController.getManagerTeams
);
router.get(
    "/manager/subordinates",
    requireRole("manager"),
    TeamController.getManagerSubordinates
);
router.get(
    "/:teamId/available-employees",
    requireRole("manager"),
    TeamController.getAvailableEmployeesForTeam
);
router.get(
    "/:teamId/projects",
    requireRole("manager"),
    TeamController.getTeamProjects
);

router.get(
    "/:teamId/tasks",
    requireRole("manager"),
    TeamController.getTeamTasks
);
// 3. Dynamic routes come last
router.put(
    "/:teamId",
    requireRole("manager"),
    validate(updateTeamValidator),
    TeamController.updateTeam
);

router.delete(
    "/:teamId",
    requireRole("manager"),
    validate(teamIdValidator),
    TeamController.deleteTeam
);

router.get(
    "/:teamId/members",
    requireRole("manager"),
    validate(teamIdValidator),
    TeamController.getTeamMembers
);

router.post(
    "/:teamId/members",
    requireRole("manager"),
    validate(addTeamMemberValidator),
    TeamController.addMember
);

router.delete(
    "/:teamId/members/:userId",
    requireRole("manager"),
    validate(removeTeamMemberValidator),
    TeamController.removeMember
);

router.get(
    "/:teamId",
    requireRole("manager"),
    validate(teamIdValidator),
    TeamController.getTeam
);
// =====================================================
// Employee Routes
// =====================================================

// View teams employee belongs to
router.get(
    "/employee",
    requireRole("employee"),
    TeamController.getEmployeeTeams
);

// View a team employee belongs to
router.get(
    "/employee/:teamId",
    requireRole("employee"),
    validate(teamIdValidator),
    TeamController.getEmployeeTeam
);

// View members of employee's team
router.get(
    "/employee/:teamId/members",
    requireRole("employee"),
    validate(teamIdValidator),
    TeamController.getEmployeeTeamMembers
);




module.exports = router;