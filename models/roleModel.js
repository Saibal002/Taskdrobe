//roldeModel.js


const query = require("../plugins/query");
/**
 * Get all roles
 */
const getAllRoles = async () => {

    const { rows } = await query(`
        SELECT *
        FROM roles
        ORDER BY role_id;
    `);

    return rows;
};

/**
 * Find Role By ID
 */
const findRoleById = async (roleId) => {

    const { rows } = await query(
        `
        SELECT *
        FROM roles
        WHERE role_id = $1;
        `,
        [roleId]
    );

    return rows[0];
};

/**
 * Find Role By Name
 */
const findRoleByName = async (roleName) => {

    const { rows } = await query(
        `
        SELECT *
        FROM roles
        WHERE role_name = $1;
        `,
        [roleName]
    );

    return rows[0];
};

module.exports = {
    getAllRoles,
    findRoleById,
    findRoleByName,
};