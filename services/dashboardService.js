const dashboardModel = require("../models/dashboardModel");

/**
 * Get Dashboard Statistics
 */
const getDashboardStats = async () => {

    const stats = await dashboardModel.getDashboardStats();

    const totalTasks = Number(stats.total_tasks);

    const completedTasks = Number(stats.completed_tasks);

    const completionRate =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

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

module.exports = {
    getDashboardStats,
};