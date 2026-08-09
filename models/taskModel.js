const query = require("../plugins/query");

/**
 * Create Task
 */
const createTask = async ({
  projectId,
  title,
  description,
  priority,
  status,
  dueDate,
  assignedTo,
  createdBy,
}) => {
  const sql = `
        INSERT INTO tasks
        (
            project_id,
            title,
            description,
            priority,
            status,
            due_date,
            assigned_to,
            created_by
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8
        )
        RETURNING *;
    `;

  const values = [
    projectId,
    title,
    description,
    priority,
    status,
    dueDate,
    assignedTo,
    createdBy,
  ];

  const { rows } = await query(sql, values);

  return rows[0];
};
/**
 * Get Tasks By Project
 */
const getTasksByProject = async (projectId) => {
  const sql = `
        SELECT
            t.*,
            u.full_name AS assigned_user
        FROM tasks t
        LEFT JOIN users u
            ON t.assigned_to = u.user_id
        WHERE t.project_id = $1
        ORDER BY t.created_at DESC;
    `;

  const { rows } = await query(sql, [projectId]);

  return rows;
};
const getTaskById = async (taskId) => {
  const sql = `
        SELECT *
        FROM tasks
        WHERE task_id = $1;
    `;

  const { rows } = await query(sql, [taskId]);

  return rows[0];
};
const updateTask = async (
  taskId,
  { title, description, priority, status, dueDate },
) => {
  const sql = `
        UPDATE tasks
        SET
            title = $1,
            description = $2,
            priority = $3,
            status = $4,
            due_date = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = $6
        RETURNING *;
    `;

  const values = [title, description, priority, status, dueDate, taskId];

  const { rows } = await query(sql, values);

  return rows[0];
};
const deleteTask = async (taskId) => {
  const sql = `
        DELETE
        FROM tasks
        WHERE task_id = $1
        RETURNING *;
    `;

  const { rows } = await query(sql, [taskId]);

  return rows[0];
};
const toggleTaskStatus = async (taskId) => {
  const sql = `
        UPDATE tasks
        SET
            status = CASE
                        WHEN status = 'Completed'
                        THEN 'Todo'::task_status
                        ELSE 'Completed'::task_status
                     END,
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = $1
        RETURNING *;
    `;

  const { rows } = await query(sql, [taskId]);

  return rows[0];
};

/**
 * Get project task statistics
 */
const getProjectTaskStats = async (projectId) => {

    const sql = `
        SELECT
            COUNT(*) AS total_tasks,

            COUNT(
                CASE
                    WHEN status = 'Completed'
                    THEN 1
                END
            ) AS completed_tasks

        FROM tasks

        WHERE project_id = $1;
    `;

    const { rows } = await query(sql, [projectId]);

    return {
        totalTasks: Number(rows[0].total_tasks),
        completedTasks: Number(rows[0].completed_tasks),
    };

};
/**
 * Get upcoming tasks for dashboard calendar
 */
const getUpcomingTasks = async (limit = 10) => {

    const sql = `
        SELECT
            t.task_id,
            t.title,
            t.description,
            t.priority,
            t.status,
            t.due_date,
            p.project_name
        FROM tasks t

        LEFT JOIN projects p
            ON t.project_id = p.project_id

        WHERE t.due_date IS NOT NULL
          AND t.due_date >= CURRENT_DATE

        ORDER BY
            t.due_date ASC

        LIMIT $1;
    `;

    const result = await query(sql, [limit]);

    return result.rows;
};
/**
 * Search Tasks
 */
const searchTasks = async (searchTerm) => {

    const sql = `
        SELECT
            t.task_id,
            t.title,
            t.description,
            t.priority,
            t.status,
            t.due_date,
            t.project_id,
            p.project_name
        FROM tasks t

        LEFT JOIN projects p
            ON t.project_id = p.project_id

        WHERE
            t.title ILIKE $1
            OR t.description ILIKE $1

        ORDER BY
            t.created_at DESC

        LIMIT 10;
    `;

    const { rows } = await query(sql, [`%${searchTerm}%`]);

    return rows;
};
module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getProjectTaskStats,
  getUpcomingTasks,
  searchTasks,
};
