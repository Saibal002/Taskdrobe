CREATE TABLE IF NOT EXISTS project_members
(
    project_member_id BIGSERIAL PRIMARY KEY,

    project_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_project_member
        UNIQUE (project_id, user_id),

    CONSTRAINT fk_project_member_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_project_member_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);