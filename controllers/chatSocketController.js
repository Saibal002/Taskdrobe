const commentService = require("../services/commentService");

const initializeChatSocket = (io) => {
    io.on("connection", (socket) => {
        
        // 1. Assign user to specific project room
        socket.on("joinProjectRoom", (projectId) => {
            socket.join(`project_${projectId}`);
        });

        // 2. Handle incoming comments
        socket.on("sendComment", async (data) => {
            try {
                const { projectId, userId, content } = data;

                // Pass to Service Layer
                const broadcastPayload = await commentService.processNewComment(projectId, userId, content);

                // Broadcast back to everyone in the room (Controller action)
                if (broadcastPayload) {
                    io.to(`project_${projectId}`).emit("newComment", broadcastPayload);
                }
            } catch (err) {
                console.error("Socket Comment Error:", err.message);
                // Optionally emit an error event back to the specific socket
                socket.emit("commentError", { message: err.message });
            }
        });
    });
};

module.exports = {
    initializeChatSocket
};