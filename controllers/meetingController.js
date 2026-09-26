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


    /**
     * Admin God Mode: View & filter all workspace meetings by creator and date
     */
    static async getAdminMeetings(req, res, next) {
        try {
            if (!req.user || req.user.role_name !== "admin") {
                throw new AppError("Access denied. Admins only.", 403);
            }

            const { organizerId, date } = req.query;

            const [meetings, organizers] = await Promise.all([
                MeetingModel.getAllMeetingsAdmin({ organizerId, date }),
                MeetingModel.getMeetingOrganizers()
            ]);

            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(200).json({ success: true, data: meetings });
            }

            res.render("adminMeetings", {
                title: "All Meetings (God Mode)",
                user: req.user,
                meetings,
                organizers,
                filters: {
                    organizerId: organizerId || "",
                    date: date || ""
                },
                page: "admin_meetings"
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete/Cancel a meeting from DB (supports Admin override)
     */
    static async deleteMeeting(req, res, next) {
        try {
            const isAdmin = req.user && req.user.role_name === "admin";
            const deleted = await MeetingModel.deleteMeeting(req.params.id, req.user.user_id, isAdmin);
            if (!deleted) throw new AppError("Meeting not found or unauthorized to cancel.", 403);
            
            return res.status(200).json({ success: true, message: "Meeting canceled and removed from database." });
        } catch (error) { next(error); }
    }
}

module.exports = MeetingController;