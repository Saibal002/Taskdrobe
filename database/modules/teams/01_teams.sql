CREATE TABLE IF NOT EXISTS teams
(
    team_id BIGSERIAL PRIMARY KEY,

    manager_id BIGINT NOT NULL,

    team_name VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_team_manager
        FOREIGN KEY (manager_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);