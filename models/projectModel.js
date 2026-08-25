const query = require("../plugins/query");

/**
 * Create Project
 */
const createProject = async ({
    projectName,
    description,
    status,
    progress,
    deadline,
    createdBy,
}) => {

    const sql = `
        INSERT INTO projects
        (
            project_name,
            description,
            status,
            progress,
            deadline,
            created_by
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )
        RETURNING *;
    `;

    const values = [
        projectName,
        description,
        status,
        progress,
        deadline,
        createdBy,
    ];

    const { rows } = await query(sql, values);

    return rows[0];
};

/**
 * Get All Projects
 */
const getAllProjects = async () => {

    const sql = `
        SELECT
            p.*,
            u.full_name
        FROM projects p
        INNER JOIN users u
            ON p.created_by = u.user_id
        ORDER BY p.created_at DESC;
    `;

    const { rows } = await query(sql);

    return rows;

};
/**
 * Update Project
 */
const updateProject = async (
    projectId,
    {
        projectName,
        description,
        status,
        progress,
        deadline,
    }
) => {

    const sql = `
        UPDATE projects
        SET
            project_name = $1,
            description = $2,
            status = $3,
            progress = $4,
            deadline = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $6
        RETURNING *;
    `;

    const values = [
        projectName,
        description,
        status,
        progress,
        deadline,
        projectId,
    ];

    const { rows } = await query(sql, values);

    return rows[0];
    

};
const deleteProject = async (projectId) => {

    const sql = `
        DELETE FROM projects
        WHERE project_id = $1
        RETURNING *;
    `;

    const { rows } = await query(sql, [projectId]);

    return rows[0];

};
/**
 * Get Project By ID
 */
const getProjectById = async (projectId) => {

    const sql = `
        SELECT
            p.*,
            u.full_name
        FROM projects p
        INNER JOIN users u
            ON p.created_by = u.user_id
        WHERE p.project_id = $1;
    `;

    const { rows } = await query(sql, [projectId]);

    return rows[0];

};

/**
 * Update project progress
 */
const updateProjectProgress = async (projectId, progress) => {

    const sql = `
        UPDATE projects
        SET progress = $1
        WHERE project_id = $2
        RETURNING *;
    `;

    const { rows } = await query(sql, [
        progress,
        projectId,
    ]);

    return rows[0];

};
/**
 * Search Projects
 */
const searchProjects = async (searchTerm) => {

    const sql = `
        SELECT
            p.project_id,
            p.project_name,
            p.description,
            p.status,
            p.progress,
            p.deadline,
            u.full_name
        FROM projects p

        INNER JOIN users u
            ON p.created_by = u.user_id

        WHERE
            p.project_name ILIKE $1
            OR p.description ILIKE $1

        ORDER BY
            p.created_at DESC

        LIMIT 10;
    `;

    const { rows } = await query(sql, [`%${searchTerm}%`]);

    return rows;
};
/**
 * Get Manager Project Statistics
 */
const getManagerProjectStats = async (managerId) => {

    const sql = `
        SELECT

            COUNT(*) AS total_projects,

            COUNT(
                CASE
                    WHEN status = 'In Progress'
                    THEN 1
                END
            ) AS active_projects,

            COUNT(
                CASE
                    WHEN status = 'Completed'
                    THEN 1
                END
            ) AS completed_projects,

            COALESCE(
                ROUND(AVG(progress), 0),
                0
            ) AS average_progress

        FROM projects

        WHERE created_by = $1;
    `;

    const { rows } = await query(sql, [managerId]);

    return {
        totalProjects: Number(rows[0].total_projects),
        activeProjects: Number(rows[0].active_projects),
        completedProjects: Number(rows[0].completed_projects),
        averageProgress: Number(rows[0].average_progress),
    };

};
/**
 * Get Projects Assigned To Employee
 */
const getProjectsByMember = async (userId) => {

    const sql = `
        SELECT
            p.*,
            u.full_name
        FROM project_members pm

        INNER JOIN projects p
            ON pm.project_id = p.project_id

        INNER JOIN users u
            ON p.created_by = u.user_id

        WHERE pm.user_id = $1

        ORDER BY p.created_at DESC;
    `;

    const { rows } = await query(sql, [userId]);

    return rows;
};

/**
 * Get Projects Created By Manager
 */
const getProjectsByManager = async (managerId) => {

    const sql = `
        SELECT
            p.*,
            u.full_name
        FROM projects p
        INNER JOIN users u
            ON p.created_by = u.user_id
        WHERE p.created_by = $1
        ORDER BY p.created_at DESC;
    `;

    const { rows } = await query(sql, [managerId]);

    return rows;
};

module.exports = {
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
    getProjectById,
    updateProjectProgress,
    searchProjects,
    getManagerProjectStats,
    getProjectsByMember,
    getProjectsByManager,
};