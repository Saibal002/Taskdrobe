
DO $$
BEGIN
    CREATE TYPE task_priority AS ENUM
(
    'Low',
    'Medium',
    'High',
    'Critical'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;