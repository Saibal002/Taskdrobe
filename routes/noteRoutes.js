const express = require("express");
const router = express.Router();
const NoteController = require("../controllers/noteController");
// const { requireAuth } = require("../middleware/authMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// All note routes require authentication
router.use(authMiddleware);

router.get("/", NoteController.getNotes);
router.post("/", NoteController.createNote);
router.get("/:id", NoteController.viewNote);
router.put("/:id", NoteController.updateNote);
router.delete("/:id", NoteController.deleteNote);

module.exports = router;