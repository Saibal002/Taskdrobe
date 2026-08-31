const chatModel = require("../models/chatModel");
const notificationModel = require("../models/notificationModel");

const initializeChatSocket = (io) => {
  io.on("connection", (socket) => {
    
    // 1. User joins their personal global room on login/page load
    socket.on("joinPersonalRoom", (userId) => {
      socket.join(`user_${userId}`);
    });

    // 2. Handle incoming 1-to-1 direct messages
    socket.on("sendDirectMessage", async (data) => {
      try {
        const { senderId, targetUserId, content } = data;

        // 2a. Ensure the conversation exists
        const conversation = await chatModel.getOrCreateConversation(senderId, targetUserId);

        // 2b. Save the message to the database
        const savedMessage = await chatModel.saveMessage(
          conversation.conversation_id, 
          senderId, 
          content.trim()
        );

        // 2c. Emit the message to the receiver's personal room
        io.to(`user_${targetUserId}`).emit("receiveDirectMessage", {
            ...savedMessage,
            conversationId: conversation.conversation_id
        });

        // 2d. Create a notification for the receiver (if you want database alerts for unread messages)
        await notificationModel.createNotification({
            userId: targetUserId,
            senderId: senderId,
            type: 'direct_message',
            referenceId: conversation.conversation_id,
            content: 'Sent you a new message'
        });

        // 2e. Trigger the red badge update on the receiver's screen
        const unreadCount = await notificationModel.getUnreadCount(targetUserId);
        io.to(`user_${targetUserId}`).emit("updateBadgeCount", unreadCount);

      } catch (err) {
        console.error("Global Chat Socket Error:", err.message);
      }
    });
    // 3. Handle Marking Messages as Read
    socket.on("markAsRead", async (data) => {
      try {
          const { conversationId, senderId, receiverId } = data; 
          
          // 1. Mark messages as read in DB
          await chatModel.markConversationAsRead(conversationId, receiverId);
          
          // 2. Clear notification badge
          await notificationModel.clearChatNotifications(receiverId, senderId);
          
          // 3. Update the receiver's global badge count instantly
          const unreadCount = await notificationModel.getUnreadCount(receiverId);
          io.to(`user_${receiverId}`).emit("updateBadgeCount", unreadCount);
          
          // 4. Alert the sender that their messages were read (so ticks turn into double checks)
          io.to(`user_${senderId}`).emit("messagesRead", { conversationId });
      } catch (err) {
          console.error("Mark Read Error:", err.message);
      }
    });

    // 3. (Optional future proofing) Handle general notifications like task assignments
    socket.on("sendNotification", async (data) => {
        try {
            const { targetUserId, senderId, type, referenceId, content } = data;
            
            await notificationModel.createNotification({
                userId: targetUserId,
                senderId,
                type,
                referenceId,
                content
            });

            const unreadCount = await notificationModel.getUnreadCount(targetUserId);
            io.to(`user_${targetUserId}`).emit("updateBadgeCount", unreadCount);
        } catch (err) {
            console.error("Notification Socket Error:", err.message);
        }
    });

    

  });
};

module.exports = {
  initializeChatSocket,
};