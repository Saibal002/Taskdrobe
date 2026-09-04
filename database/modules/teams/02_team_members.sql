CREATE TABLE IF NOT EXISTS team_members
(
    team_member_id BIGSERIAL PRIMARY KEY,

    team_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    joined_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_team_member
        UNIQUE (team_id, user_id),

    CONSTRAINT fk_team_member_team
        FOREIGN KEY (team_id)
        REFERENCES teams(team_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_team_member_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);