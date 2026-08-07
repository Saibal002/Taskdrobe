DO $$
BEGIN

    CREATE TYPE task_status AS ENUM
    (
        'Todo',
        'In Progress',
        'In Review',
        'Completed',
        'Cancelled'
    );

EXCEPTION

    WHEN duplicate_object THEN
        NULL;

END $$;