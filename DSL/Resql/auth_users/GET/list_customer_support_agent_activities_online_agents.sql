SELECT
    id_code,
    active,
    status
FROM denorm_user_csa_authority_profile_settings
WHERE
    (status = 'online')
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        GROUP BY id_code
    );
