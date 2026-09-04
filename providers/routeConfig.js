const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const homeRoute = require("../routes/homeRoute");
const authRoute = require("../routes/authRoute");
const dashboardRoute = require("../routes/dashboardRoute");
const adminRoute = require("../routes/adminRoutes");
const managerRoute = require("../routes/managerRoutes");
const projectRoute = require("../routes/projectRoute");
const projectMemberRoutes = require("../routes/projectMemberRoutes");
const teamRoute = require("../routes/teamRoute");
const taskRoute = require("../routes/taskRoute");
const searchRoute = require("../routes/searchRoute");
const profileRoute = require("../routes/profileRoute");
const chatRoutes = require("../routes/chatRoute");
const notificationRoute = require("../routes/notificationRoute");

module.exports = {
  public: [
    {
      path: "/",
      router: homeRoute,
    },
    {
      path: "/auth",
      router: authRoute,
    },
  ],

 protected: [
    // 1. Explicitly named paths go first
    {
      path: "/teams",
      router: teamRoute,
    },
    {
      path: "/projects",
      router: projectRoute,
    },
    {
      path: "/tasks",
      router: taskRoute,
    },
    {
      path: "/search",
      router: searchRoute,
    },
    
    // 2. Root-mounted routers go last to prevent wildcard interception
    {
      path: "/",
      router: dashboardRoute,
    },
    {
      path: "/",
      router: projectMemberRoutes,
    },
    {
      path: "/",
      router: profileRoute,
    },
  ],
  api: [
    {
      path: "/chat",
      router: chatRoutes,
    },
    {
      path: "/notifications",
      router: notificationRoute,
    },
  ],

  roles: [
    {
      path: "/admin",
      router: adminRoute,
      middleware: [authMiddleware, requireRole("admin")],
    },
    {
      path: "/manager",
      router: managerRoute,
      middleware: [authMiddleware, requireRole("manager")],
    },
  ],
};
