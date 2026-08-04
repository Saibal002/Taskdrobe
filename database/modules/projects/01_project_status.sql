DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'project_status'
    ) THEN

        CREATE TYPE project_status AS ENUM
        (
            'Not Started',
            'In Progress',
            'Completed',
            'On Hold',
            'Archived'
        );

    END IF;
END $$;