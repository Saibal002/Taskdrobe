-- 08_notifications.sql
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'message', 'task_assigned', 'project_invite'
    reference_id BIGINT, -- The ID of the task, project, or message
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);