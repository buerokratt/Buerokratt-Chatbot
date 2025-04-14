SELECT
    id_code,
    active,
    status
FROM denorm_user_csa_authority_profile_settings
WHERE
    id_code = :customerSupportId
ORDER BY id DESC
LIMIT 1;
