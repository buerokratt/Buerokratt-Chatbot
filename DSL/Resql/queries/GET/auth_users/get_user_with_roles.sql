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
    login = :login
ORDER BY id DESC
LIMIT 1;
