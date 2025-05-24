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
FROM auth_users.denormalized_user_data AS d_1
WHERE
    user_status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND created = (
        SELECT MAX(d_2.created) FROM auth_users.denormalized_user_data AS d_2
        WHERE d_1.id_code = d_2.id_code
    );
