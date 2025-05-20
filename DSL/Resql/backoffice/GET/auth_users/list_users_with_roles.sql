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
    user_status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND id IN (
        SELECT MAX(id) FROM denormalized_user_data
        GROUP BY id_code
    );
