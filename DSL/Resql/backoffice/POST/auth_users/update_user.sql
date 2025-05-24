SELECT copy_row_with_modifications(
    'auth_users."user"',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'first_name', '', :firstName,
        'last_name', '', :lastName,
        'display_name', '', :displayName,
        'status', '::USER_STATUS', :status,
        'csa_title', '', :csaTitle,
        'csa_email', '', :csaEmail,
        'department', '', :department,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
) FROM auth_users."user"
WHERE created = (
    SELECT MAX(created) FROM auth_users."user"
    WHERE id_code = :userIdCode
);