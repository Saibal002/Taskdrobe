const ActivityService = require("../services/activityService");

const getRecentActivity = async (req, res, next) => {
    try {
        const activities = await ActivityService.getRecent(10);

        res.json({
            success: true,
            data: activities
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getRecentActivity
};