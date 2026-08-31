const notificationModel = require("../models/notificationModel");

const initializeNotificationSocket = (io) => {

    const notificationIO = io.of("/notifications");

    notificationIO.on("connection", (socket) => {

        console.log(
            `🔔 Notification socket connected: ${socket.id}`
        );

        // =====================================================
        // JOIN USER'S NOTIFICATION ROOM
        // =====================================================

        socket.on("joinNotificationRoom", async (userId) => {

            try {

                const room = `notification_user_${userId}`;

                socket.join(room);

                console.log(
                    `🔔 Notification socket ${socket.id} joined ${room}`
                );

                // Send existing unread count immediately.
                const unreadCount =
                    await notificationModel.getUnreadCount(
                        userId
                    );

                socket.emit(
                    "notificationCountUpdated",
                    unreadCount
                );

            } catch (err) {

                console.error(
                    "Notification room error:",
                    err.message
                );
            }
        });

    });

    return notificationIO;
};

module.exports = {
    initializeNotificationSocket
};