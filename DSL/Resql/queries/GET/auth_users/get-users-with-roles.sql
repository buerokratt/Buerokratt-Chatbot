SELECT
    u.login,
    u.first_name,
    u.last_name,
    u.id_code,
    u.display_name,
    u.csa_title,
    u.csa_email,
    ua.authority_name AS authorities
FROM "user" AS u
    LEFT JOIN (
        SELECT
            ua.authority_name,
            ua.user_id
        FROM user_authority AS ua
        WHERE ua.id IN (
            SELECT MAX(id)
            FROM user_authority
            GROUP BY user_id
        )
    ) AS ua ON u.id_code = ua.user_id
WHERE
    status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND id IN (
        SELECT MAX(id) FROM "user"
        GROUP BY id_code
    );
