SELECT id_code
FROM denorm_user_csa_authority_profile_settings
WHERE
    id_code = :userIdCode
    AND user_status <> 'deleted'
    AND status = ANY(:statuses::STATUS [])
ORDER BY id DESC
LIMIT 1;
