
// const projectMemberService = require("../services/projectMemberService");
// const userModel = require("../models/userModel");
// const notificationModel = require("../models/notificationModel");
// const projectModel = require("../models/projectModel");

// /**
//  * Add Employee To Project
//  */
// const addMember = async (req, res, next) => {
//     try {
//         const { projectId } = req.params;
//         const { userId } = req.body;

//         // =====================================================
//         // 1. EXISTING FUNCTIONALITY
//         // =====================================================

//         const member =
//             await projectMemberService.addMember(
//                 projectId,
//                 userId,
//                 req.user.user_id
//             );

//         // =====================================================
//         // 2. GET PROJECT INFORMATION
//         // =====================================================

//         const project =
//             await projectModel.getProjectById(projectId);

//         // =====================================================
//         // 3. CREATE SYSTEM NOTIFICATION
//         // =====================================================

//         const notification =
//             await notificationModel.createNotification({
//                 userId,
//                 senderId: req.user.user_id,
//                 type: "project_member_added",
//                 referenceId: projectId,
//                 content: project
//                     ? `You were added to project "${project.project_name}".`
//                     : "You were added to a project."
//             });

//         // =====================================================
//         // 4. REAL-TIME SYSTEM NOTIFICATION
//         // =====================================================

//         const notificationIO =
//             req.app.get("notificationIO");

//         if (notificationIO) {

//             const unreadCount =
//                 await notificationModel.getUnreadCount(userId);

//             const room =
//                 `notification_user_${userId}`;

//             notificationIO
//                 .to(room)
//                 .emit(
//                     "newSystemNotification",
//                     notification
//                 );

//             notificationIO
//                 .to(room)
//                 .emit(
//                     "notificationCountUpdated",
//                     unreadCount
//                 );
//         }

//         // =====================================================
//         // 5. EXISTING RESPONSE
//         // =====================================================

//         return res.status(201).json({
//             success: true,
//             message:
//                 "Employee added to project successfully.",
//             member
//         });

//     } catch (err) {
//         next(err);
//     }
// };


// /**
//  * Remove Employee From Project
//  */
// const removeMember = async (req, res, next) => {
//     try {

//         const {
//             projectId,
//             userId
//         } = req.params;

//         // =====================================================
//         // 1. GET PROJECT INFORMATION BEFORE REMOVAL
//         // =====================================================

//         const project =
//             await projectModel.getProjectById(projectId);

//         // =====================================================
//         // 2. REMOVE MEMBER
//         // =====================================================

//         const removedMember =
//             await projectMemberService.removeMember(
//                 projectId,
//                 userId,
//                 req.user.user_id
//             );

//         // =====================================================
//         // 3. CREATE SYSTEM NOTIFICATION
//         // =====================================================

//         const notification =
//             await notificationModel.createNotification({
//                 userId,
//                 senderId: req.user.user_id,
//                 type: "project_member_removed",
//                 referenceId: projectId,
//                 content: project
//                     ? `You were removed from project "${project.project_name}".`
//                     : "You were removed from a project."
//             });

//         // =====================================================
//         // 4. REAL-TIME SYSTEM NOTIFICATION
//         // =====================================================

//         const notificationIO =
//             req.app.get("notificationIO");

//         if (notificationIO) {

//             const unreadCount =
//                 await notificationModel.getUnreadCount(userId);

//             const room =
//                 `notification_user_${userId}`;

//             notificationIO
//                 .to(room)
//                 .emit(
//                     "newSystemNotification",
//                     notification
//                 );

//             notificationIO
//                 .to(room)
//                 .emit(
//                     "notificationCountUpdated",
//                     unreadCount
//                 );
//         }

//         // =====================================================
//         // 5. EXISTING RESPONSE
//         // =====================================================

//         return res.json({
//             success: true,
//             message:
//                 "Employee removed from project successfully.",
//             removedMember
//         });

//     } catch (err) {
//         next(err);
//     }
// };


// /**
//  * Manage Project Members Page
//  */
// // const getMembers = async (req, res, next) => {
// //     try {

// //         const {
// //             projectId
// //         } = req.params;

// //         const managerId =
// //             req.user.user_id;

// //         const members =
// //             await projectMemberService.getMembers(
// //                 projectId,
// //                 managerId
// //             );

// //         const employees =
// //             await userModel.getAllEmployees();

// //         const memberIds =
// //             new Set(
// //                 members.map(
// //                     member =>
// //                         String(member.user_id)
// //                 )
// //             );

// //         const availableEmployees =
// //             employees.filter(
// //                 employee =>
// //                     !memberIds.has(
// //                         String(employee.user_id)
// //                     )
// //             );

// //         return res.render(
// //             "manager/projectMembers",
// //             {
// //                 title: "Manage Project Members",
// //                 user: req.user,
// //                 projectId,
// //                 members,
// //                 employees,
// //             }
// //         );

// //     } catch (err) {
// //         next(err);
// //     }
// // };


// /**
//  * AJAX: Get Project Members
//  *
//  * Manager:
//  *   Can view their own project.
//  *
//  * Admin:
//  *   Can view any project.
//  */
// const getMembersData = async (req, res, next) => {
//     try {

//         const {
//             projectId
//         } = req.params;

//         const {
//             members,
//             availableEmployees
//         } =
//             await projectMemberService.getMembersForView(
//                 projectId,
//                 req.user
//             );

//         return res.json({
//             success: true,
//             members,
//             availableEmployees
//         });

//     } catch (err) {
//         next(err);
//     }
// };


// module.exports = {
//     addMember,
//     removeMember,
    
//     getMembersData
// };

