const express = require("express");
const router = express.Router();
const MeetingController = require("../controllers/meetingController");
const authMiddleware = require("../middleware/authMiddleware");

// All meeting routes require authentication
router.use(authMiddleware);

router.get("/", MeetingController.getMeetings);
router.post("/", MeetingController.createMeeting);
router.delete("/:id", MeetingController.deleteMeeting);

module.exports = router;