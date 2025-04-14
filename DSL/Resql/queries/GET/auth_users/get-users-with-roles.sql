SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    csa_title,
    csa_email,
    authority_name AS authorities
FROM denorm_user_csa_authority_profile_settings
WHERE
    user_status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        GROUP BY id_code
    );
