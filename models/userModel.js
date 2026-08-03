const query = require("../plugins/query");



/**
 * Create User
 */
const createUser = async ({
    roleId,
    fullName,
    email,
    password,
    phone = null,
    profileImage = null,
}) => {

    const sql = `
        INSERT INTO users
        (
            role_id,
            full_name,
            email,
            password,
            phone,
            profile_image
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
        roleId,
        fullName,
        email,
        password,
        phone,
        profileImage,
    ];

    const { rows } = await query(sql, values);

    return rows[0];
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
    const params = [email];

    const sql= `
        SELECT *
        FROM users
        WHERE email = $1;
    `;

    const { rows } = await query(sql, params);

    return rows[0];
};

/**
 * Find user by ID
 */
const findUserById = async (userId) => {
    const params = [userId];
    const sql = `
        SELECT *
        FROM users
        WHERE user_id = $1;
    `;

    const { rows } = await query(sql, params);

    return rows[0];
};

/**
 * Update Last Login
 */
const updateLastLogin = async (userId) => {
    const params = [userId];
    const sql = `
        UPDATE users
        SET last_login = CURRENT_TIMESTAMP
        WHERE user_id = $1;
    `;

    await query(sql, params);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateLastLogin,
};