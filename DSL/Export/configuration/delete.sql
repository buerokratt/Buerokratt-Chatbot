DELETE FROM configuration
WHERE (key, created) NOT IN (
    SELECT key, max(created)
    FROM configuration
    GROUP BY key
) AND created < CURRENT_DATE - INTERVAL '2 days';
