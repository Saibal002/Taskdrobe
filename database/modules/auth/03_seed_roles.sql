INSERT INTO roles
(
    role_name,
    description
)
VALUES
(
    'admin',
    'System Administrator'
),
(
    'manager',
    'Project Manager'
),
(
    'employee',
    'Organization Employee'
)
ON CONFLICT(role_name) DO NOTHING;