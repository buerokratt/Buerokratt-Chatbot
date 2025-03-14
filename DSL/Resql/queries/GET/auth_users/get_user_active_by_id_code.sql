SELECT u.id_code
FROM "user" AS u
    INNER JOIN customer_support_agent_activity AS csaa ON u.id_code = csaa.id_code
WHERE
    u.id_code = :userIdCode
    AND u.status <> 'deleted'
    AND u.id IN (
        SELECT MAX(u_2.id) FROM "user" AS u_2
        WHERE u_2.id_code = :userIdCode
    )
    AND csaa.status = ANY(:statuses::STATUS [])
    AND csaa.id IN (
        SELECT MAX(csaa_2.id) FROM customer_support_agent_activity AS csaa_2
        WHERE csaa_2.id_code = :userIdCode
    );
