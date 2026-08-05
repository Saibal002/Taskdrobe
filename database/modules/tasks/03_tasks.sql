CREATE TABLE IF NOT EXISTS tasks
(
    task_id BIGSERIAL PRIMARY KEY,

    project_id BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    priority task_priority
        DEFAULT 'Medium',

    status task_status
        DEFAULT 'Todo',

    due_date DATE,

    assigned_to BIGINT,

    created_by BIGINT NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_creator
        FOREIGN KEY (created_by)
        REFERENCES users(user_id),

    CONSTRAINT fk_task_assignee
        FOREIGN KEY (assigned_to)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);