const query = require("../plugins/query");
const cacheService = require("../services/cacheService");

/**
 * Get dashboard statistics (Optimized with single-pass FILTER + 60s Cache)
 */
const getDashboardStats = async (userId, role) => {
    const cacheKey = `dashboard:stats:${role}:${userId}`;

    return await cacheService.getOrSet(cacheKey, 60, async () => {
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
            WITH project_counts AS (
                SELECT
                    COUNT(*) AS total_projects,
                    COUNT(*) FILTER (WHERE projects.status = 'In Progress') AS active_projects,
                    COUNT(*) FILTER (WHERE projects.status = 'Completed') AS completed_projects
                FROM projects ${pJoin}
                WHERE ${pWhere}
            ),
            task_counts AS (
                SELECT
                    COUNT(*) AS total_tasks,
                    COUNT(*) FILTER (WHERE tasks.status = 'Completed') AS completed_tasks,
                    COUNT(*) FILTER (WHERE tasks.status <> 'Completed') AS pending_tasks,
                    COUNT(*) FILTER (WHERE tasks.due_date < CURRENT_DATE AND tasks.status <> 'Completed') AS overdue_tasks
                FROM tasks
                WHERE ${tWhere}
            )
            SELECT 
                p.total_projects, p.active_projects, p.completed_projects,
                t.total_tasks, t.completed_tasks, t.pending_tasks, t.overdue_tasks
            FROM project_counts p, task_counts t;
        `;

        const { rows } = await query(sql, params);
        return rows[0];
    });
};

/**
 * Task Chart Data (Single-pass scan + 60s Cache)
 */
const getTaskChartData = async (userId, role) => {
    const cacheKey = `dashboard:taskChart:${role}:${userId}`;

    return await cacheService.getOrSet(cacheKey, 60, async () => {
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
                COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
                COUNT(*) FILTER (WHERE status <> 'Completed') AS pending,
                COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status <> 'Completed') AS overdue
            FROM tasks
            WHERE ${tWhere};
        `;

        const { rows } = await query(sql, params);
        return rows[0];
    });
};

/**
 * Project Status Chart (60s Cache)
 */
const getProjectChartData = async (userId, role) => {
    const cacheKey = `dashboard:projectChart:${role}:${userId}`;

    return await cacheService.getOrSet(cacheKey, 60, async () => {
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
    });
};

/**
 * Get Admin User Statistics (60s Cache)
 */
const getAdminUserStats = async () => {
    return await cacheService.getOrSet("dashboard:adminUserStats", 60, async () => {
        const sql = `
            SELECT
                COUNT(*) AS total_users,
                COUNT(*) FILTER (WHERE is_active = TRUE) AS active_users,
                COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive_users
            FROM users;
        `;

        const { rows } = await query(sql);
        return rows[0];
    });
};

/**
 * Get Top 5 Busiest Employees (Admin Global View - 60s Cache)
 */
const getTopEmployeesWorkload = async () => {
    return await cacheService.getOrSet("dashboard:topWorkload", 60, async () => {
        const sql = `
            SELECT 
                u.full_name,
                COUNT(t.task_id) AS total_tasks,
                COUNT(*) FILTER (WHERE t.status = 'Completed') AS completed_tasks
            FROM users u
            JOIN tasks t ON u.user_id = t.assigned_to
            WHERE u.is_active = TRUE
            GROUP BY u.user_id, u.full_name
            ORDER BY total_tasks DESC
            LIMIT 5;
        `;
        const { rows } = await query(sql);
        return rows;
    });
};

module.exports = {
    getDashboardStats,
    getTaskChartData,
    getProjectChartData,
    getAdminUserStats,
    getTopEmployeesWorkload,
};