const commentModel = require("../models/commentModel");

const fetchProjectComments = async (projectId) => {
    return await commentModel.getProjectComments(projectId);
};

const processNewComment = async (projectId, userId, content) => {
    if (!content || !content.trim()) {
        throw new Error("Comment content cannot be empty.");
    }

    // 1. Save to Database
    const savedComment = await commentModel.addComment({
        projectId,
        userId,
        content: content.trim()
    });

    // 2. Fetch the rich comment data (with full_name, profile_image) for the broadcast
    const comments = await commentModel.getProjectComments(projectId);
    const broadcastPayload = comments.find(c => String(c.comment_id) === String(savedComment.comment_id));

    return broadcastPayload;
};

module.exports = {
    fetchProjectComments,
    processNewComment
};