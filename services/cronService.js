const cron = require("node-cron");
const query = require("../plugins/query");
const MeetingModel = require("../models/meetingModel");
const notificationModel = require("../models/notificationModel");

class CronService {
    static init(io) {
        if (!io) return;

        cron.schedule("* * * * *", async () => {
            try {
                const sql = `
                    SELECT * FROM meetings 
                    WHERE start_time >= (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
                      AND start_time < (CURRENT_TIMESTAMP + INTERVAL '16 minutes');
                `;
                
                const { rows } = await query(sql);
                
                for (const meeting of rows) {
                    const recipientIds = await MeetingModel.getTeamRecipientIds(meeting.team_id);
                    const content = `Reminder: Team meeting "${meeting.title}" starts in 15 minutes!`;

                    for (const uid of recipientIds) {
                        await notificationModel.createNotification({
                            userId: uid,
                            senderId: meeting.organizer_id,
                            type: "meeting_reminder",
                            referenceId: meeting.meeting_id,
                            content
                        });
                    }

                    io.emit("meetingReminder", {
                        meetingId: meeting.meeting_id,
                        teamId: Number(meeting.team_id),
                        title: meeting.title,
                        meetingLink: meeting.meeting_link,
                        startTime: meeting.start_time,
                        recipientIds
                    });
                }
            } catch (error) {
                console.error("[Cron Error]:", error);
            }
        });
    }
}

module.exports = CronService;