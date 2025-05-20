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
FROM denormalized_user_data
WHERE
    login = :login
ORDER BY id DESC
LIMIT 1;
