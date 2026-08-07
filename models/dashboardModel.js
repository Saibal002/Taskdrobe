const query = require("../plugins/query");

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {

    const sql = `
        SELECT

    /* Projects */
    (SELECT COUNT(*)
     FROM projects)
        AS total_projects,

    (SELECT COUNT(*)
     FROM projects
     WHERE status = 'In Progress')
        AS active_projects,

    (SELECT COUNT(*)
     FROM projects
     WHERE status = 'Completed')
        AS completed_projects,

    /* Tasks */
    (SELECT COUNT(*)
     FROM tasks)
        AS total_tasks,

    (SELECT COUNT(*)
     FROM tasks
     WHERE status = 'Completed')
        AS completed_tasks,

    (SELECT COUNT(*)
     FROM tasks
     WHERE status <> 'Completed')
        AS pending_tasks,

    (SELECT COUNT(*)
     FROM tasks
     WHERE due_date < CURRENT_DATE
     AND status <> 'Completed')
        AS overdue_tasks;
    `;

    const { rows } = await query(sql);

    return rows[0];

};
const getTaskChartData = async () => {

    const sql = `
        SELECT

            (SELECT COUNT(*)
             FROM tasks
             WHERE status = 'Completed')
                AS completed,

            (SELECT COUNT(*)
             FROM tasks
             WHERE status <> 'Completed')
                AS pending,

            (SELECT COUNT(*)
             FROM tasks
             WHERE due_date < CURRENT_DATE
             AND status <> 'Completed')
                AS overdue;
    `;

    const { rows } = await query(sql);

    return rows[0];

};

module.exports = {
    getDashboardStats,
    getTaskChartData,
};