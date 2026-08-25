const projectService = require("../services/projectService");
const dashboardService = require("../services/dashboardService");
const taskModel = require("../models/taskModel");

/**
 * Employee Dashboard
 */
const dashboard = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role_name === "employee") {
      projects = await projectService.getProjectsByMember(req.user.user_id);
    } else {
      projects = await projectService.getAllProjects();
    }

    const stats = await dashboardService.getDashboardStats();
    const chartData = await dashboardService.getTaskChartData();
    const projectChartData = await dashboardService.getProjectChartData();
    const upcomingTasks = await taskModel.getUpcomingTasks(10);

    res.render("dashboard", {
      title: "Dashboard",

      user: req.user,

      today: new Date().toDateString(),

      projects,

      stats,

      chartData,
      projectChartData,
      upcomingTasks,
    });
  } catch (err) {
    next(err);
  }
};



/**
 * Admin Dashboard
 */
const adminDashboard = async (req, res, next) => {
  try {
    const userStats = await dashboardService.getAdminUserStats();

    const stats = await dashboardService.getDashboardStats();

    const chartData = await dashboardService.getTaskChartData();
    const projectChartData = await dashboardService.getProjectChartData();

    res.render("admin/dashboard", {
      title: "Admin Dashboard",

      user: req.user,

      userStats,

      stats,
      chartData,
      projectChartData,
    });
  } catch (err) {
    next(err);
  }
};




/**
 * Manager Dashboard
 */
const managerDashboard = async (req, res, next) => {
  try {
    const managerId = req.user.user_id;
    const projectStats = await dashboardService.getManagerProjectStats(
      managerId,
    );
     const projects =
            await projectService.getProjectsByManager(
                managerId
            );
    res.render("manager/dashboard", {
      title: "Manager Dashboard",

      user: req.user,

      projectStats,
      projects, //that the manager has created
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  adminDashboard,
  managerDashboard,
};
