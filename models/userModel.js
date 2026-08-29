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
       RETURNING
    user_id,
    role_id,
    full_name,
    email,
    phone,
    profile_image,
    is_active,
    created_at,
    updated_at;
    `;

  const values = [roleId, fullName, email, password, phone, profileImage];

  const { rows } = await query(sql, values);

  return rows[0];
};

/**
 * Find user by email (Updated for Profiles)
 */
const findUserByEmail = async (email) => {
    const sql = `
        SELECT
            u.user_id,
            u.role_id,
            u.full_name,
            u.email,
            u.password,
            u.is_active,
            u.last_login,
            r.role_name,
            p.phone,
            p.profile_image,
            p.bio
        FROM users u
        INNER JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE u.email = $1;
    `;
    const { rows } = await query(sql, [email]);
    return rows[0];
};

/**
 * Find User By ID (Updated for Profiles)
 */
const findUserById = async (userId) => {
    const sql = `
        SELECT
            u.user_id,
            u.full_name,
            u.email,
            u.is_active,
            r.role_name,
            r.description AS role_description,
            p.phone,
            p.profile_image,
            p.bio
        FROM users u
        INNER JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE u.user_id = $1;
    `;
    const { rows } = await query(sql, [userId]);
    return rows[0];
};

/**
 * Upsert User Profile (Insert if new, Update if exists)
 */
const upsertUserProfile = async (userId, { phone, profileImage, bio }) => {
    const sql = `
        INSERT INTO user_profiles (user_id, phone, profile_image, bio, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            phone = EXCLUDED.phone,
            profile_image = COALESCE(EXCLUDED.profile_image, user_profiles.profile_image),
            bio = EXCLUDED.bio,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    const values = [userId, phone, profileImage, bio];
    const { rows } = await query(sql, values);
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

/**
 * Get All Active Employees
 */
const getAllEmployees = async () => {

    const sql = `
        SELECT
            u.user_id,
            u.full_name,
            u.email,
            u.phone,
            u.profile_image,
            u.is_active
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.role_id
        WHERE r.role_name = 'employee'
          AND u.is_active = TRUE
        ORDER BY u.full_name;
    `;

    const { rows } = await query(sql);

    return rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  upsertUserProfile,
  findUserById,
  updateLastLogin,
  getAllEmployees,
};
