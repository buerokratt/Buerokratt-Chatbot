WITH
    grouped_configurations AS (
        SELECT MAX(id) AS max_id
        FROM configuration
        GROUP BY key
    )

SELECT
    (
        CASE WHEN (est.value IS NULL OR est.deleted IS TRUE) THEN '' ELSE est.value END
    ) AS est,
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
        key = 'greeting_message_est'
        AND id IN (SELECT max_id FROM grouped_configurations)
    UNION ALL
    SELECT
        NULL,
        NULL,
        NULL,
        NULL
    LIMIT 1
) AS est,
    (
        SELECT
            id,
            key,
            value,
            deleted
        FROM configuration
        WHERE
            key = 'is_greeting_message_active'
            AND id IN (SELECT max_id FROM grouped_configurations)
        UNION ALL
        SELECT
            NULL,
            NULL,
            NULL,
            NULL
        LIMIT 1
    ) AS active;
