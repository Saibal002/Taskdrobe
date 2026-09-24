const NoteModel = require("../models/noteModel");
const AppError = require("../utils/AppError");

class NoteController {
    /**
     * Render the main Notes (Knowledge Base) page
     */
    static async getNotes(req, res, next) {
        try {
            const notes = await NoteModel.getVisibleNotes(req.user.user_id);
            
            // Return JSON for AJAX requests, otherwise render the page
            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(200).json({ success: true, data: notes });
            }
            
            res.render("notes", { 
                title: "Knowledge Base", 
                user: req.user, 
                notes, 
                page: "notes" 
            });
        } catch (error) { next(error); }
    }

    /**
     * View a single note
     */
    static async viewNote(req, res, next) {
        try {
            const note = await NoteModel.getNoteById(req.params.id, req.user.user_id);
            if (!note) throw new AppError("Note not found or access denied.", 404);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(200).json({ success: true, data: note });
            }
            
            res.render("notes", { 
                title: note.title, 
                user: req.user, 
                note, 
                page: "notes" 
            });
        } catch (error) { next(error); }
    }

    /**
     * Create a new note
     */
    static async createNote(req, res, next) {
        try {
            const { title, description, body, isPublic } = req.body;
            const note = await NoteModel.createNote({
                userId: req.user.user_id,
                title,
                description,
                body,
                isPublic: isPublic === 'true' || isPublic === true
            });
            
            return res.status(201).json({ success: true, message: "Note created successfully.", data: note });
        } catch (error) { next(error); }
    }

    /**
     * Update an existing note
     */
    static async updateNote(req, res, next) {
        try {
            const { title, description, body, isPublic } = req.body;
            const note = await NoteModel.updateNote(req.params.id, req.user.user_id, {
                title, 
                description, 
                body, 
                isPublic: isPublic === 'true' || isPublic === true
            });
            
            if (!note) throw new AppError("Unauthorized to update this note.", 403);
            
            return res.status(200).json({ success: true, message: "Note updated successfully.", data: note });
        } catch (error) { next(error); }
    }

    /**
     * Delete a note
     */
    static async deleteNote(req, res, next) {
        try {
            const deleted = await NoteModel.deleteNote(req.params.id, req.user.user_id);
            if (!deleted) throw new AppError("Unauthorized to delete this note.", 403);
            
            return res.status(200).json({ success: true, message: "Note deleted successfully." });
        } catch (error) { next(error); }
    }
}

module.exports = NoteController;