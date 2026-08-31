const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Expose the API endpoints
router.get("/contacts", authMiddleware, chatController.getContacts);
router.get("/history/:targetUserId", authMiddleware, chatController.getChatHistory);

module.exports = router;