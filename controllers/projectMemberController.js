const projectMemberService = require("../services/projectMemberService");

/**
 * Add Employee To Project
 */
const addMember = async (req, res, next) => {

    try {

        const { projectId } = req.params;
        const { userId } = req.body;

        const member =
            await projectMemberService.addMember(
                projectId,
                userId
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
            userId
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
 * Get Project Members
 */
const getMembers = async (req, res, next) => {

    try {

        const { projectId } = req.params;

        const members =
            await projectMemberService.getMembers(
                projectId
            );

        return res.json({
            success: true,
            members,
        });

    } catch (err) {

        next(err);

    }

};


module.exports = {
    addMember,
    removeMember,
    getMembers,
};