CREATE TABLE conversations (
    conversation_id SERIAL PRIMARY KEY,
    user1_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    user2_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure user1_id is always less than user2_id to prevent duplicate rows for the same pair
    CONSTRAINT check_user_order CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);