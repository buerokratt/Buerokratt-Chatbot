DELETE FROM establishment
WHERE (base_id, created) NOT IN (
    SELECT base_id, max(created)
    FROM establishment
    GROUP BY base_id
) AND created < CURRENT_DATE - INTERVAL '2 days';
