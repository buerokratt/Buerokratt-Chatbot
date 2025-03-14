SELECT COUNT(id) AS count
FROM customer_support_agent_activity
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(c_2.id) FROM customer_support_agent_activity AS c_2
        GROUP BY c_2.id_code
    );
