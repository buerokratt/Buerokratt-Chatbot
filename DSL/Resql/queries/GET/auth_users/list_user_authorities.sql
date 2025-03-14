SELECT ua.authority_name AS authorities
FROM "user" AS u
    INNER JOIN (
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
    u.id_code = :userIdCode
    AND status <> 'deleted'
    AND id IN (
        SELECT MAX(id) FROM "user"
        WHERE id_code = :userIdCode
    )
