SELECT copy_row_with_modifications(
    'denorm_user_csa_authority_profile_settings',
       'id', '::INTEGER', id,
       'first_name', '', :firstName,
       'last_name', '', :lastName,
       'display_name', '', :displayName,
       'csa_title', '', :csaTitle,
       'csa_email', '', :csaEmail,
       'department', '', :department,
       'user_status', '::user_status', :userStatus,
       'authority_name', '::TEXT[]', (ARRAY[:roles])::TEXT,
       'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
) FROM denorm_user_csa_authority_profile_settings
WHERE id_code = :userIdCode
ORDER BY id DESC
LIMIT 1;
