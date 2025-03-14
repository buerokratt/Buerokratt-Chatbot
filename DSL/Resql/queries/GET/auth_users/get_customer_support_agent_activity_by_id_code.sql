SELECT
    id_code,
    active,
    status
FROM customer_support_agent_activity
WHERE
    id_code = :customerSupportId
    AND id IN (
        SELECT MAX(c_2.id) FROM customer_support_agent_activity AS c_2
        WHERE c_2.id_code = :customerSupportId
    )
