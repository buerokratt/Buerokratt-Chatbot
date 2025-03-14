SELECT
    id,
    key,
    value
FROM configuration
WHERE
    key = :key
    AND id IN (
        SELECT MAX(id) FROM configuration
        GROUP BY key
    )
    AND NOT deleted;
