CREATE TABLE IF NOT EXISTS projects
(
    project_id BIGSERIAL PRIMARY KEY,

    project_name VARCHAR(150) NOT NULL,

    description TEXT,

    status project_status
        DEFAULT 'Not Started',

    progress INTEGER
        DEFAULT 0
        CHECK (progress BETWEEN 0 AND 100),

    start_date DATE
        DEFAULT CURRENT_DATE,

    deadline DATE,

    created_by BIGINT NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_creator
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);