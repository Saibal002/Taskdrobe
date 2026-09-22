const projectService = require("../services/projectService");
const dashboardService = require("../services/dashboardService");
const taskModel = require("../models/taskModel");
/**
 * Employee Dashboard
 */
const dashboard = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role_name;
    let projects;

    // Filter projects
    if (role === "employee") {
      projects = await projectService.getProjectsByMember(userId);
    } else {
      projects = await projectService.getAllProjects();
    }

    // Pass userId and role into the services to scope the data
    const stats = await dashboardService.getDashboardStats(userId, role);
    const chartData = await dashboardService.getTaskChartData(userId, role);
    const projectChartData = await dashboardService.getProjectChartData(userId, role);
    const upcomingTasks = await taskModel.getUpcomingTasks(10, userId, role);

    res.render("emp_dashboard", {
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
    res.render("manager/man_dashboard", {
      title: "Manager Dashboard",

      user: req.user,
      
      projectStats,
      today: new Date().toDateString(),
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
