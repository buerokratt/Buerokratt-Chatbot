DELETE FROM config.configuration
WHERE (key, created) NOT IN (
    SELECT key, max(created)
    FROM config.configuration
    GROUP BY key
) AND created < %(export_boundary)s;
