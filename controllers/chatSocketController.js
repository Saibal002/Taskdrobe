const chatModel = require("../models/chatModel");

const initializeChatSocket = (io) => {

    io.on("connection", (socket) => {

        // =====================================================
        // GLOBAL CHAT PERSONAL ROOM
        // =====================================================

        socket.on("joinPersonalRoom", (userId) => {

            const room = `user_${userId}`;

            socket.join(room);

            console.log(
                `💬 Chat socket ${socket.id} joined ${room}`
            );
        });


        // =====================================================
        // DIRECT MESSAGE
        // =====================================================

        socket.on("sendDirectMessage", async (data) => {

            try {

                const {
                    senderId,
                    targetUserId,
                    content
                } = data;

                // 1. Ensure conversation exists
                const conversation =
                    await chatModel.getOrCreateConversation(
                        senderId,
                        targetUserId
                    );

                // 2. Save message
                const savedMessage =
                    await chatModel.saveMessage(
                        conversation.conversation_id,
                        senderId,
                        content.trim()
                    );

                // 3. Deliver message to receiver
                io.to(`user_${targetUserId}`)
                    .emit("receiveDirectMessage", {
                        ...savedMessage,
                        conversationId:
                            conversation.conversation_id
                    });

            } catch (err) {

                console.error(
                    "Global Chat Socket Error:",
                    err.message
                );
            }
        });


        // =====================================================
        // MARK CHAT MESSAGES AS READ
        // =====================================================

        socket.on("markAsRead", async (data) => {

            try {

                const {
                    conversationId,
                    senderId,
                    receiverId
                } = data;

                // Mark actual chat messages as read.
                await chatModel.markConversationAsRead(
                    conversationId,
                    receiverId
                );

                // Tell sender that their messages were read.
                io.to(`user_${senderId}`)
                    .emit("messagesRead", {
                        conversationId
                    });

            } catch (err) {

                console.error(
                    "Mark Read Error:",
                    err.message
                );
            }
        });

    });
};

module.exports = {
    initializeChatSocket
};