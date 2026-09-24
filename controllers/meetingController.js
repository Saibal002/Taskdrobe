const MeetingModel = require("../models/meetingModel");
const AppError = require("../utils/AppError");

class MeetingController {
    /**
     * Render the main Schedule page or return JSON for AJAX
     */
    static async getMeetings(req, res, next) {
        try {
            const meetings = await MeetingModel.getUpcomingMeetings();
            
            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(200).json({ success: true, data: meetings });
            }
            
            res.render("meetings", { 
                title: "Schedule", 
                user: req.user, 
                meetings, 
                page: "meetings" 
            });
        } catch (error) { next(error); }
    }

    /**
     * Attempt to schedule a new meeting
     */
    static async createMeeting(req, res, next) {
        try {
            const { title, description, meetingLink, startTime, endTime } = req.body;
            
            // Basic timeline validation
            if (new Date(startTime) >= new Date(endTime)) {
                throw new AppError("End time must be after start time.", 400);
            }

            const meeting = await MeetingModel.createMeeting({
                organizerId: req.user.user_id,
                title,
                description,
                meetingLink,
                startTime,
                endTime
            });
            
            // We will add Socket.io notifications here in a later step
            // EMIT REAL-TIME NOTIFICATION (If Socket.io is attached to app)
            const io = req.app.get('io');
            if (io) {
                io.emit('newMeetingScheduled', {
                    title: meeting.title,
                    startTime: meeting.start_time
                });
            }
            return res.status(201).json({ success: true, message: "Meeting scheduled successfully.", data: meeting });
        } catch (error) { 
            // Model throws a 409 AppError if times overlap; pass it to error handler
            next(error); 
        }
    }

    /**
     * Cancel/Delete a meeting
     */
    static async deleteMeeting(req, res, next) {
        try {
            const deleted = await MeetingModel.deleteMeeting(req.params.id, req.user.user_id);
            if (!deleted) throw new AppError("Unauthorized to cancel this meeting.", 403);
            
            return res.status(200).json({ success: true, message: "Meeting canceled successfully." });
        } catch (error) { next(error); }
    }
}

module.exports = MeetingController;