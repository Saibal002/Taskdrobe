const MeetingModel = require("../models/meetingModel");
const notificationModel = require("../models/notificationModel");
const AppError = require("../utils/AppError");

class MeetingController {
    static async getMeetings(req, res, next) {
        try {
            const userId = req.user.user_id;
            const [meetings, teams] = await Promise.all([
                MeetingModel.getUpcomingMeetings(userId),
                MeetingModel.getUserTeams(userId)
            ]);
            
            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(200).json({ success: true, data: meetings, teams });
            }
            
            res.render("meetings", { 
                title: "Schedule", 
                user: req.user, 
                meetings,
                teams,
                page: "meetings" 
            });
        } catch (error) { next(error); }
    }

    static async createMeeting(req, res, next) {
        try {
            const { teamId, title, description, meetingLink, startTime, endTime } = req.body;
            const organizerId = Number(req.user.user_id);
            
            if (!teamId) {
                throw new AppError("Please select a team for this meeting.", 400);
            }

            if (new Date(startTime) >= new Date(endTime)) {
                throw new AppError("End time must be after start time.", 400);
            }

            const meeting = await MeetingModel.createMeeting({
                organizerId,
                teamId,
                title,
                description,
                meetingLink,
                startTime,
                endTime
            });

            const allTeamUserIds = await MeetingModel.getTeamRecipientIds(teamId);
            const targetUserIds = allTeamUserIds.filter(id => id !== organizerId);

            for (const uid of targetUserIds) {
                await notificationModel.createNotification({
                    userId: uid,
                    senderId: organizerId,
                    type: "meeting_scheduled",
                    referenceId: meeting.meeting_id,
                    content: `New team meeting scheduled: "${meeting.title}"`
                });
            }

            const io = req.app.get("io");
            if (io) {
                io.emit("newMeetingScheduled", {
                    meetingId: meeting.meeting_id,
                    teamId: Number(teamId),
                    title: meeting.title,
                    startTime: meeting.start_time,
                    recipientIds: targetUserIds
                });
            }
            
            return res.status(201).json({ success: true, message: "Meeting scheduled successfully.", data: meeting });
        } catch (error) { 
            next(error); 
        }
    }

    static async deleteMeeting(req, res, next) {
        try {
            const deleted = await MeetingModel.deleteMeeting(req.params.id, req.user.user_id);
            if (!deleted) throw new AppError("Meeting not found or unauthorized to cancel.", 403);
            
            return res.status(200).json({ success: true, message: "Meeting canceled and removed from database." });
        } catch (error) { next(error); }
    }
}

module.exports = MeetingController;