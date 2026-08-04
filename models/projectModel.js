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

module.exports = {
    createProject,
    getAllProjects,
};