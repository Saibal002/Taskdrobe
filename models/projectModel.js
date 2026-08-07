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

module.exports = {
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
    getProjectById,
    updateProjectProgress,
};