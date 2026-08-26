const projectMemberService = require("../services/projectMemberService");
const userModel = require("../models/userModel");

/**
 * Add Employee To Project
 */
const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const member = await projectMemberService.addMember(
      projectId,
      userId,
      req.user.user_id,
    );

    return res.status(201).json({
      success: true,
      message: "Employee added to project successfully.",
      member,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove Employee From Project
 */
const removeMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    await projectMemberService.removeMember(
      projectId,
      userId,
      req.user.user_id,
    );

    return res.json({
      success: true,
      message: "Employee removed from project successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Manage Project Members Page
 */
const getMembers = async (req, res, next) => {
    try {

        const { projectId } = req.params;
        const managerId = req.user.user_id;

        const members =
            await projectMemberService.getMembers(
                projectId,
                managerId
            );

        const employees =
    await userModel.getAllEmployees();

const memberIds = new Set(
    members.map(member => String(member.user_id))
);

const availableEmployees = employees.filter(
    employee =>
        !memberIds.has(String(employee.user_id))
);

        return res.render("manager/projectMembers", {
            title: "Manage Project Members",
            user: req.user,
            projectId,
            members,
            employees,
        });

    } catch (err) {
        next(err);
    }
};

/**
 * AJAX: Get Project Members
 *
 * Manager:
 *   Can view their own project.
 *
 * Admin:
 *   Can view any project.
 */
const getMembersData = async (req, res, next) => {
    try {

        const { projectId } = req.params;

        const {
            members,
            availableEmployees
        } = await projectMemberService.getMembersForView(
            projectId,
            req.user
        );

        return res.json({
            success: true,
            members,
            availableEmployees
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
  addMember,
  removeMember,
  getMembers,
  getMembersData

};
