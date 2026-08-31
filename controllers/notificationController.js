const notificationModel =
    require("../models/notificationModel");


// ============================================================
// GET NOTIFICATIONS
// ============================================================

const getNotifications = async (req, res, next) => {

    try {

        const notifications =
            await notificationModel.getUserNotifications(
                req.user.user_id
            );

        return res.json({
            success: true,
            notifications
        });

    } catch (err) {

        next(err);
    }
};


// ============================================================
// GET UNREAD COUNT
// ============================================================

const getUnreadCount = async (req, res, next) => {

    try {

        const unreadCount =
            await notificationModel.getUnreadCount(
                req.user.user_id
            );

        return res.json({
            success: true,
            unreadCount
        });

    } catch (err) {

        next(err);
    }
};


// ============================================================
// MARK ONE AS READ
// ============================================================

const markAsRead = async (req, res, next) => {

    try {

        const notification =
            await notificationModel.markAsRead(
                req.params.id,
                req.user.user_id
            );

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        const unreadCount =
            await notificationModel.getUnreadCount(
                req.user.user_id
            );


        // Update navbar in other open tabs/windows.
        const notificationIO =
            req.app.get("notificationIO");

        if (notificationIO) {

            notificationIO
                .to(
                    `notification_user_${req.user.user_id}`
                )
                .emit(
                    "notificationCountUpdated",
                    unreadCount
                );
        }


        return res.json({
            success: true,
            notification,
            unreadCount
        });

    } catch (err) {

        next(err);
    }
};


// ============================================================
// MARK ALL AS READ
// ============================================================

const markAllAsRead = async (req, res, next) => {

    try {

        await notificationModel.markAllAsRead(
            req.user.user_id
        );

        const notificationIO =
            req.app.get("notificationIO");

        if (notificationIO) {

            notificationIO
                .to(
                    `notification_user_${req.user.user_id}`
                )
                .emit(
                    "notificationCountUpdated",
                    0
                );
        }

        return res.json({
            success: true,
            unreadCount: 0
        });

    } catch (err) {

        next(err);
    }
};


module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};