SELECT id_code
FROM denorm_user_csa_authority_profile_settings
WHERE
    id_code = :userIdCode
    AND user_status <> 'deleted'
    AND active = 'true'
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        WHERE id_code = :userIdCode
    );
