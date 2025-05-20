SELECT authority_name AS authorities
FROM denorm_user_csa_authority_profile_settings
WHERE
    id_code = :userIdCode
    AND user_status <> 'deleted'
ORDER BY id DESC
LIMIT 1;
