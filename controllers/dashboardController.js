const projectService = require("../services/projectService");
const dashboardService = require("../services/dashboardService");
const taskModel = require("../models/taskModel");
const dashboardModel = require("../models/dashboardModel");
const NoteModel = require("../models/noteModel");
const meetingModel = require("../models/meetingModel");
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
    const allNotes = await NoteModel.getVisibleNotes(userId);
    const recentNotes = allNotes.slice(0, 3);
    res.render("emp_dashboard", {
      title: "Dashboard",
      user: req.user,
      today: new Date().toDateString(),
      projects,
      stats,
      chartData,
      projectChartData,
      upcomingTasks,
      recentNotes
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
    const topEmployees = await dashboardModel.getTopEmployeesWorkload();
    res.render("admin/dashboard", {
      title: "Admin Dashboard",

      user: req.user,

      userStats,

      stats,
      chartData,
      projectChartData,
      topEmployees,
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
    const role = req.user.role_name; // "manager"

    const projectStats = await dashboardService.getManagerProjectStats(managerId);
    const projects = await projectService.getProjectsByManager(managerId);
    
    // FETCH MISSING CHART DATA
    const chartData = await dashboardService.getTaskChartData(managerId, role);
    const projectChartData = await dashboardService.getProjectChartData(managerId, role);
    // FETCH RECENT NOTES (Limit to 3 for the widget)
    const allNotes = await NoteModel.getVisibleNotes(managerId);
    const recentNotes = allNotes.slice(0, 3);
    const workspaceMeetings = await meetingModel.getUpcomingMeetings();
    res.render("manager/man_dashboard", {
      title: "Manager Dashboard",
      user: req.user,
      projectStats,
      today: new Date().toDateString(),
      projects, 
      
      // PASS DATA TO THE COMPONENT
      chartData,
      projectChartData,
      recentNotes,
      workspaceMeetings
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
