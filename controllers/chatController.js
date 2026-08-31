const chatModel = require("../models/chatModel");

const getContacts = async (req, res, next) => {
    try {
        const currentUserId = req.user.user_id;
        const contacts = await chatModel.getChatContacts(currentUserId);
        
        return res.json({ success: true, contacts });
    } catch (err) {
        console.error("Fetch Contacts Error:", err);
        return res.status(500).json({ success: false, message: "Unable to load contacts." });
    }
};

const getChatHistory = async (req, res, next) => {
    try {
        const currentUserId = req.user.user_id;
        const targetUserId = req.params.targetUserId;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ success: false, message: "Cannot chat with yourself." });
        }

        // Get or initialize the conversation bridge
        const conversation = await chatModel.getOrCreateConversation(currentUserId, targetUserId);
        
        // Fetch historical messages
        const messages = await chatModel.getMessages(conversation.conversation_id);

        return res.json({ 
            success: true, 
            conversationId: conversation.conversation_id,
            messages 
        });
    } catch (err) {
        console.error("Fetch History Error:", err);
        return res.status(500).json({ success: false, message: "Unable to load chat history." });
    }
};

module.exports = {
    getContacts,
    getChatHistory
};