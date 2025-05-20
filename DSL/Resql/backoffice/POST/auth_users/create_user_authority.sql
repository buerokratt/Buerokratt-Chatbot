SELECT copy_row_with_modifications(
    'denormalized_user_data',
    'id', '::INTEGER', id::VARCHAR,
    ARRAY[
         'first_name', '', :firstName,
        'last_name', '', :lastName,
        'display_name', '', :displayName,
        'csa_title', '', :csaTitle,
        'csa_email', '', :csaEmail,
        'department', '', :department,
        'user_status', '::user_status', :userStatus,
        'authority_name', '::VARCHAR[]', (ARRAY[:roles])::VARCHAR,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
) FROM denormalized_user_data
WHERE id_code = :userIdCode
ORDER BY id DESC
LIMIT 1;
