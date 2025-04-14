SELECT COUNT(id) AS count
FROM denorm_user_csa_authority_profile_settings
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(d.id) FROM denorm_user_csa_authority_profile_settings AS d
        GROUP BY d.id_code
    );
