CREATE TABLE IF NOT EXISTS user_profiles
(
    profile_id BIGSERIAL PRIMARY KEY,
    
    user_id BIGINT NOT NULL UNIQUE,
    
    phone VARCHAR(20),
    
    profile_image VARCHAR(255),
    
    bio TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);