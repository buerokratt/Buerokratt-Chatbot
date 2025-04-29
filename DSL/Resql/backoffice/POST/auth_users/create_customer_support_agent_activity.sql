SELECT copy_row_with_modifications(
    'denorm_user_csa_authority_profile_settings',
   'id', '::INTEGER', id,
    'status', '::status', :status,
    'status_comment', '', :statusComment,
    'csa_created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR,
    'active', '::BOOL', :active::VARCHAR,
    'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
)
FROM denorm_user_csa_authority_profile_settings
WHERE id_code = :userIdCode
ORDER BY id DESC
LIMIT 1;
