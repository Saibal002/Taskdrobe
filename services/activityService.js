const ActivityModel = require("../models/activityModel");

const ActivityService = {
    /**
     * Record a workspace activity.
     *
     * This is the single entry point that other services
     * should use when something meaningful happens.
     */
    async log({
        userId,
        action,
        entityType,
        entityId = null,
        description
    }) {
        if (!userId) {
            throw new Error("Activity userId is required.");
        }

        if (!action) {
            throw new Error("Activity action is required.");
        }

        if (!entityType) {
            throw new Error("Activity entityType is required.");
        }

        if (!description) {
            throw new Error("Activity description is required.");
        }

        return await ActivityModel.create({
            userId,
            action,
            entityType,
            entityId,
            description
        });
    },

    /**
     * Get the latest workspace activities.
     */
    async getRecent(limit = 10) {
        const safeLimit = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            50
        );

        return await ActivityModel.getRecent(safeLimit);
    }
};

module.exports = ActivityService;