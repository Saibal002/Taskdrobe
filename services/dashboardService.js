const dashboardModel = require("../models/dashboardModel");
const taskModel = require("../models/taskModel");
const projectModel = require("../models/projectModel");

/**
 * Get Dashboard Statistics
 */
const getDashboardStats = async (userId, role) => {
    // Pass user context down to the model
    const stats = await dashboardModel.getDashboardStats(userId, role);

    const totalTasks = Number(stats.total_tasks);
    const completedTasks = Number(stats.completed_tasks);
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
        totalProjects: Number(stats.total_projects),
        activeProjects: Number(stats.active_projects),
        completedProjects: Number(stats.completed_projects),
        totalTasks,
        completedTasks,
        pendingTasks: Number(stats.pending_tasks),
        overdueTasks: Number(stats.overdue_tasks),
        completionRate,
    };
};

/**
 * Task Chart Data
 */
const getTaskChartData = async (userId, role) => {
    // Pass user context down to the model
    const data = await dashboardModel.getTaskChartData(userId, role);

    return {
        completed: Number(data.completed),
        pending: Number(data.pending),
        overdue: Number(data.overdue),
    };
};

/**
 * Project Chart Data
 */
const getProjectChartData = async (userId, role) => {
    // Pass user context down to the model
    const rows = await dashboardModel.getProjectChartData(userId, role);

    return rows.map(row => ({
        status: row.status,
        total: Number(row.total),
    }));
};

/**
 * Get Upcoming Tasks
 */
const getUpcomingTasks = async (limit, userId, role) => {
    // Delegate to taskModel so SQL stays out of the service layer
    return await taskModel.getUpcomingTasks(limit, userId, role);
};

/**
 * Get Admin User Statistics
 */
const getAdminUserStats = async () => {
    const stats = await dashboardModel.getAdminUserStats();

    return {
        totalUsers: Number(stats.total_users),
        activeUsers: Number(stats.active_users),
        inactiveUsers: Number(stats.inactive_users),
    };
};

const getManagerProjectStats = async (managerId) => {
    return await projectModel.getManagerProjectStats(managerId);
};

module.exports = {
    getDashboardStats,
    getTaskChartData,
    getProjectChartData,
    getUpcomingTasks,
    getAdminUserStats,
    getManagerProjectStats,
};