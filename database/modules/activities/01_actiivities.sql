CREATE TABLE IF NOT EXISTS activities
(
    activity_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    action VARCHAR(50) NOT NULL,

    entity_type VARCHAR(50) NOT NULL,

    entity_id BIGINT,

    description VARCHAR(255) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_created_at
    ON activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_user_id
    ON activities(user_id);

CREATE INDEX IF NOT EXISTS idx_activities_entity
    ON activities(entity_type, entity_id);