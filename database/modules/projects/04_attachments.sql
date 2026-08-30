CREATE TABLE IF NOT EXISTS attachments
(
    attachment_id BIGSERIAL PRIMARY KEY,
    
    project_id BIGINT NOT NULL,
    
    task_id BIGINT,
    
    uploaded_by BIGINT NOT NULL,
    
    original_name VARCHAR(255) NOT NULL,
    
    file_path VARCHAR(255) NOT NULL,
    
    file_type VARCHAR(50) NOT NULL,
    
    file_size BIGINT NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attachment_project
        FOREIGN KEY(project_id)
        REFERENCES projects(project_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_attachment_task
        FOREIGN KEY(task_id)
        REFERENCES tasks(task_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_attachment_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);