WITH
    grouped_configurations AS (
        SELECT DISTINCT ON (key) id, key, created
        FROM config.configuration
        ORDER BY key, created DESC
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
    FROM config.configuration
    WHERE
        key = 'greeting_message_est'
        AND id IN (SELECT id FROM grouped_configurations)
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
        FROM config.configuration
        WHERE
            key = 'is_greeting_message_active'
            AND id IN (SELECT id FROM grouped_configurations)
        UNION ALL
        SELECT
            NULL,
            NULL,
            NULL,
            NULL
        LIMIT 1
    ) AS active;
