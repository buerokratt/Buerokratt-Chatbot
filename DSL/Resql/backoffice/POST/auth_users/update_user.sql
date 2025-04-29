SELECT copy_row_with_modifications(
    '"user"',
    'id', '::INTEGER', id::VARCHAR,
    'first_name', '', :firstName,
    'last_name', '', :lastName,
    'display_name', '', :displayName,
    'status', '::USER_STATUS', :status,
    'csa_title', '', :csaTitle,
    'csa_email', '', :csaEmail,
    'department', '', :department,
    'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
) FROM "user"
WHERE id = (
    SELECT MAX(id) FROM "user"
    WHERE id_code = :userIdCode
);