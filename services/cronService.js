const cron = require('node-cron');
const query = require('../plugins/query');

class CronService {
    static init(io) {
        if (!io) return;

        // Run every minute
        cron.schedule('* * * * *', async () => {
            try {
                const sql = `
                    SELECT * FROM meetings 
                    WHERE start_time >= (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
                      AND start_time < (CURRENT_TIMESTAMP + INTERVAL '16 minutes');
                `;
                
                const { rows } = await query(sql);
                
                if (rows.length > 0) {
                    for (const meeting of rows) {
                        // 1. Broadcast real-time event for the SweetAlert
                        io.emit('meetingReminder', {
                            meetingId: meeting.meeting_id,
                            title: meeting.title,
                            meetingLink: meeting.meeting_link,
                            startTime: meeting.start_time
                        });
                        
                        // 2. Insert into the database notification panel for all users
                        // Note: Adjust the column names (message, link, type) if your notifications schema differs
                        const notifSql = `
                            INSERT INTO notifications (user_id, message, link, type, is_read)
                            SELECT user_id, $1, '/meetings', 'meeting', false FROM users;
                        `;
                        const message = `Reminder: "${meeting.title}" starts in 15 minutes.`;
                        
                        try {
                            await query(notifSql, [message]);
                        } catch (dbErr) {
                            console.error('[Cron] Could not insert notifications (check schema):', dbErr.message);
                        }

                        console.log(`[Cron] Sent 15-min reminder and created notifications for: ${meeting.title}`);
                    }
                }
            } catch (error) {
                console.error('[Cron Error] Failed to fetch upcoming meetings:', error);
            }
        });

        console.log('[Cron Service] 15-minute meeting reminder initialized.');
    }
}

module.exports = CronService;