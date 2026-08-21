const projectService = require("../services/projectService");
const dashboardService = require("../services/dashboardService");
const taskModel = require("../models/taskModel");

/**
 * Dashboard
 */
const dashboard = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();

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
const adminDashboard = async (req, res, next) => {

    try {

        res.render("admin/dashboard", {

            title: "Admin Dashboard",

            user: req.user,

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

        res.render("manager/dashboard", {

            title: "Manager Dashboard",

            user: req.user,

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
