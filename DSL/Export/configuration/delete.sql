DELETE FROM configuration
WHERE (key, created) NOT IN (
    SELECT key, max(created)
    FROM configuration
    GROUP BY key
) AND created < %(export_boundary)s;
