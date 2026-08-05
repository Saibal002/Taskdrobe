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

module.exports = {
    createTask,
};