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
 * Remove Profile Image
 */
const removeProfileImage = async (userId) => {
    const sql = `
        UPDATE user_profiles 
        SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $1;
    `;
    await query(sql, [userId]);
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
/**
 * Admin: Update User
 */
const updateUserAdmin = async (userId, fullName, email, roleId, isActive) => {
    const sql = `
        UPDATE users 
        SET full_name = $1, email = $2, role_id = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $5 
        RETURNING user_id, full_name, email, role_id, is_active, profile_image;
    `;
    const { rows } = await query(sql, [fullName, email, roleId, isActive, userId]);
    return rows[0];
};

/**
 * Admin: Delete User
 */
const deleteUser = async (userId) => {
    const sql = `DELETE FROM users WHERE user_id = $1 RETURNING user_id;`;
    const { rows } = await query(sql, [userId]);
    return rows[0];
};


// Save the reset token and expiration date
const setPasswordResetToken = async (email, token, expiresAt) => {
    const sql = `
        UPDATE users 
        SET reset_password_token = $1, reset_password_expires = $2 
        WHERE email = $3 
        RETURNING *;
    `;
    const { rows } = await query(sql, [token, expiresAt, email]);
    return rows[0];
};

// Find a user by a valid token that hasn't expired yet
const getUserByValidResetToken = async (token) => {
    const sql = `
        SELECT * FROM users 
        WHERE reset_password_token = $1 
        AND reset_password_expires > CURRENT_TIMESTAMP;
    `;
    const { rows } = await query(sql, [token]);
    return rows[0];
};

// Clear the token after a successful reset
const clearPasswordResetToken = async (userId, newHashedPassword) => {
    const sql = `
        UPDATE users 
        SET password = $1, reset_password_token = NULL, reset_password_expires = NULL 
        WHERE user_id = $2 
        RETURNING *;
    `;
    const { rows } = await query(sql, [newHashedPassword, userId]);
    return rows[0];
};

/**
 * Update User Password from profile page (for logged-in users)
 */
const updatePassword = async (userId, hashedPassword) => {
    const sql = `
        UPDATE users 
        SET password = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $2;
    `;
    await query(sql, [hashedPassword, userId]);
};

module.exports = {
  createUser,
  findUserByEmail,
  upsertUserProfile,
  updateUserAdmin,
  deleteUser,
  findUserById,
  updateLastLogin,
  getAllEmployees,
    setPasswordResetToken,
    getUserByValidResetToken,
    clearPasswordResetToken,
    updatePassword,
    removeProfileImage
};
