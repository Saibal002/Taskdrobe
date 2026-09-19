// const query = require("../plugins/query");

// /**
//  * Add User To Project
//  */
// const addProjectMember = async (projectId, userId) => {
//   const sql = `
//         INSERT INTO project_members
//         (
//             project_id,
//             user_id
//         )
//         VALUES
//         (
//             $1,
//             $2
//         )
//         ON CONFLICT (project_id, user_id)
//         DO NOTHING
//         RETURNING *;
//     `;

//   const { rows } = await query(sql, [projectId, userId]);

//   return rows[0];
// };

// /**
//  * Remove User From Project
//  */
// const removeProjectMember = async (projectId, userId) => {
//   const sql = `
//         DELETE FROM project_members
//         WHERE project_id = $1
//           AND user_id = $2
//         RETURNING *;
//     `;

//   const { rows } = await query(sql, [projectId, userId]);

//   return rows[0];
// };

// /**
//  * Get Project Members
//  */
// const getProjectMembers = async (projectId) => {
//   const sql = `
//         SELECT
//             u.user_id,
//             u.full_name,
//             u.email,
//             u.profile_image,
//             u.is_active,
//             r.role_name

//         FROM project_members pm

//         INNER JOIN users u
//             ON pm.user_id = u.user_id

//         INNER JOIN roles r
//             ON u.role_id = r.role_id

//         WHERE pm.project_id = $1
//   AND u.is_active = TRUE
//   AND r.role_name = 'employee'

//         ORDER BY u.full_name;
//     `;

//   const { rows } = await query(sql, [projectId]);

//   return rows;
// };

// /**
//  * Check Project Membership
//  */
// const isProjectMember = async (projectId, userId) => {
//   const sql = `
//         SELECT 1
//         FROM project_members
//         WHERE project_id = $1
//           AND user_id = $2
//         LIMIT 1;
//     `;

//   const { rows } = await query(sql, [projectId, userId]);

//   return rows.length > 0;
// };
// const getProjectMemberIds = async (projectId) => {

//     const sql = `
//         SELECT user_id
//         FROM project_members
//         WHERE project_id = $1;
//     `;

//     const { rows } =
//         await query(sql, [projectId]);

//     return rows.map(row => row.user_id);
// };
// module.exports = {
//   addProjectMember,
//   removeProjectMember,
//   getProjectMembers,
//   isProjectMember,
//   getProjectMemberIds,
// };
