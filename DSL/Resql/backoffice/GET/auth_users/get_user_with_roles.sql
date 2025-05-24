SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    CASE
        WHEN :is_csa_title_visible = 'true' THEN csa_title
        ELSE ''
    END AS csa_title,
    csa_email,
    authority_name AS authorities
FROM auth_users.denormalized_user_data
WHERE
    id_code = :login
ORDER BY created DESC
LIMIT 1;
