const projectService = require("../services/projectService");
const dashboardService = require("../services/dashboardService");

/**
 * Dashboard
 */
const dashboard = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();

    const stats = await dashboardService.getDashboardStats();
    const chartData = await dashboardService.getTaskChartData();

    res.render("dashboard", {
      title: "Dashboard",

      user: req.user,

      today: new Date().toDateString(),

      projects,

      stats,

      chartData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
};
