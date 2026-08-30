const commentService = require("../services/commentService");
const commentModel = require("../models/commentModel.js");
const initializeChatSocket = (io) => {
  io.on("connection", (socket) => {
    // 1. Assign user to specific project room
    socket.on("joinProjectRoom", (projectId) => {
      socket.join(`project_${projectId}`);
    });
    socket.on("joinTaskRoom", (taskId) => {
      socket.join(`task_${taskId}`);
    });

    // 2. Handle incoming comments
    socket.on("sendComment", async (data) => {
      try {
        const { projectId, userId, content, replyToId } = data; // Catch replyToId

        const savedComment = await commentModel.addComment({
          projectId,
          userId,
          content: content.trim(),
          replyToId: replyToId || null,
        });

        const comments = await commentModel.getProjectComments(projectId);
        const broadcastPayload = comments.find(
          (c) => String(c.comment_id) === String(savedComment.comment_id),
        );

        if (broadcastPayload) {
          io.to(`project_${projectId}`).emit("newComment", broadcastPayload);
        }
      } catch (err) {
        console.error("Socket Comment Error:", err.message);
      }
    });
    // 2. Handle incoming TASK comments
  // 2. Handle incoming TASK comments
    socket.on("sendTaskComment", async (data) => {
      try {
        // ADDED: Catch replyToId from the frontend data
        const { projectId, taskId, userId, content, replyToId } = data; 

        // Save to DB
        const savedComment = await commentModel.addComment({
          projectId,
          taskId,
          userId,
          content: content.trim(),
          replyToId: replyToId || null, // ADDED: Pass it to the database model
        });

        // Fetch full payload to broadcast (with names/images)
        const comments = await commentModel.getTaskComments(taskId);
        const broadcastPayload = comments.find(
          (c) => String(c.comment_id) === String(savedComment.comment_id),
        );

        // Broadcast back to the task room
        if (broadcastPayload) {
          io.to(`task_${taskId}`).emit("newTaskComment", broadcastPayload);
        }
      } catch (err) {
        console.error("Task Socket Error:", err.message);
      }
    });
    // 2. Add Delete Event Listener
socket.on("deleteComment", async (data) => {
    try {
        const { commentId, userId, room } = data; 
        
        const deleted = await commentModel.deleteComment(commentId, userId);
        
        if (deleted) {
            // Tell everyone in the room to remove this bubble from the DOM
            io.to(room).emit("commentDeleted", commentId);
        }
    } catch (err) {
        console.error("Socket Delete Error:", err.message);
    }
});
  });
};

module.exports = {
  initializeChatSocket,
};
