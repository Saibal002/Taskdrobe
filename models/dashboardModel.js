const query = require("../plugins/query");

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (userId, role) => {
    let pJoin = "";
    let pWhere = "1=1";
    let tWhere = "1=1";
    const params = [];

    if (role === "employee") {
        params.push(userId);
        pJoin = "JOIN team_members tm ON projects.team_id = tm.team_id";
        pWhere = "tm.user_id = $1";
        tWhere = "tasks.assigned_to = $1";
    } else if (role === "manager") {
        params.push(userId);
        pWhere = "projects.created_by = $1";
        tWhere = "tasks.project_id IN (SELECT project_id FROM projects WHERE created_by = $1)";
    }

    const sql = `
        SELECT
            /* Projects */
            (SELECT COUNT(*) FROM projects ${pJoin} WHERE ${pWhere}) AS total_projects,
            (SELECT COUNT(*) FROM projects ${pJoin} WHERE status = 'In Progress' AND ${pWhere}) AS active_projects,
            (SELECT COUNT(*) FROM projects ${pJoin} WHERE status = 'Completed' AND ${pWhere}) AS completed_projects,

            /* Tasks */
            (SELECT COUNT(*) FROM tasks WHERE ${tWhere}) AS total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'Completed' AND ${tWhere}) AS completed_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status <> 'Completed' AND ${tWhere}) AS pending_tasks,
            (SELECT COUNT(*) FROM tasks WHERE due_date < CURRENT_DATE AND status <> 'Completed' AND ${tWhere}) AS overdue_tasks;
    `;

    const { rows } = await query(sql, params);
    return rows[0];
};

/**
 * Task Chart Data
 */
const getTaskChartData = async (userId, role) => {
    let tWhere = "1=1";
    const params = [];

    if (role === "employee") {
        params.push(userId);
        tWhere = "assigned_to = $1";
    } else if (role === "manager") {
        params.push(userId);
        tWhere = "project_id IN (SELECT project_id FROM projects WHERE created_by = $1)";
    }

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM tasks WHERE status = 'Completed' AND ${tWhere}) AS completed,
            (SELECT COUNT(*) FROM tasks WHERE status <> 'Completed' AND ${tWhere}) AS pending,
            (SELECT COUNT(*) FROM tasks WHERE due_date < CURRENT_DATE AND status <> 'Completed' AND ${tWhere}) AS overdue;
    `;

    const { rows } = await query(sql, params);
    return rows[0];
};

/**
 * Project Status Chart
 */
const getProjectChartData = async (userId, role) => {
    let pJoin = "";
    let pWhere = "";
    const params = [];

    if (role === "employee") {
        params.push(userId);
        pJoin = "JOIN team_members tm ON projects.team_id = tm.team_id";
        pWhere = "WHERE tm.user_id = $1";
    } else if (role === "manager") {
        params.push(userId);
        pWhere = "WHERE projects.created_by = $1";
    }

    const sql = `
        SELECT
            status,
            COUNT(*) AS total
        FROM projects
        ${pJoin}
        ${pWhere}
        GROUP BY status
        ORDER BY status;
    `;

    const { rows } = await query(sql, params);
    return rows;
};

/**
 * Get Admin User Statistics
 */
const getAdminUserStats = async () => {
    const sql = `
        SELECT
            COUNT(*) AS total_users,
            COUNT(CASE WHEN is_active = TRUE THEN 1 END) AS active_users,
            COUNT(CASE WHEN is_active = FALSE THEN 1 END) AS inactive_users
        FROM users;
    `;

    const { rows } = await query(sql);
    return rows[0];
};
/**
 * Get Top 5 Busiest Employees (Admin Global View)
 */
const getTopEmployeesWorkload = async () => {
    const sql = `
        SELECT 
            u.full_name,
            COUNT(t.task_id) AS total_tasks,
            COALESCE(SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END), 0) AS completed_tasks
        FROM users u
        JOIN tasks t ON u.user_id = t.assigned_to
        WHERE u.is_active = TRUE
        GROUP BY u.user_id, u.full_name
        ORDER BY total_tasks DESC
        LIMIT 5;
    `;
    const { rows } = await query(sql);
    return rows;
};
module.exports = {
    getDashboardStats,
    getTaskChartData,
    getProjectChartData,
    getAdminUserStats,
    getTopEmployeesWorkload,
};