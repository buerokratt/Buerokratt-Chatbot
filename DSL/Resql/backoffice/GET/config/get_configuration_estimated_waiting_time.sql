WITH
    grouped_configurations AS (
        SELECT DISTINCT ON (key) id, key, created
        FROM configuration
        ORDER BY key, created DESC
    )

SELECT
    (
        CASE
            WHEN (time.value IS NULL OR time.deleted IS TRUE) THEN '' ELSE time.value
        END
    ) AS time,
    (
        COALESCE((active.value = 'true' AND active.deleted IS FALSE), FALSE)
    ) AS is_active
FROM (
    SELECT
        id,
        key,
        value,
        deleted
    FROM configuration
    WHERE
        key = 'estimated_waiting_time'
        AND id IN (SELECT id FROM grouped_configurations)
    UNION ALL
    SELECT
        NULL,
        NULL,
        NULL,
        NULL
    LIMIT 1
) AS time,
    (
        SELECT
            id,
            key,
            value,
            deleted
        FROM configuration
        WHERE
            key = 'is_estimated_waiting_time_active'
            AND id IN (SELECT id FROM grouped_configurations)
        UNION ALL
        SELECT
            NULL,
            NULL,
            NULL,
            NULL
        LIMIT 1
    ) AS active;
