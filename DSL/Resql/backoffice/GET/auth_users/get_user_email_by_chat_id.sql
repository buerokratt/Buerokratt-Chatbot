SELECT csa_email
FROM "user"
    INNER JOIN (
        SELECT
            c.customer_support_id,
            c.base_id
        FROM chat AS c
        WHERE c.base_id = :chatId
    ) AS c ON id_code = c.customer_support_id
WHERE
    status <> 'deleted'
    AND id IN (
        SELECT MAX(id) FROM "user"
        GROUP BY id_code
    )
