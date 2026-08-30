CREATE TABLE IF NOT EXISTS comments
(
    comment_id BIGSERIAL PRIMARY KEY,
    
    project_id BIGINT NOT NULL,
    
    task_id BIGINT, 
    
    user_id BIGINT NOT NULL,
    
    content TEXT NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_project
        FOREIGN KEY(project_id)
        REFERENCES projects(project_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_task
        FOREIGN KEY(task_id)
        REFERENCES tasks(task_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);