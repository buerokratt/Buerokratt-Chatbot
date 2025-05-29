/*
declaration:
  version: 0.1
  description: "Fetch the estimated waiting time value and whether it is currently active"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: time
        type: string
        description: "Value of the estimated waiting time configuration (empty string if not set or deleted)"
      - field: is_active
        type: boolean
        description: "Whether the estimated waiting time feature is currently active"
*/
WITH
    grouped_configurations AS (
        SELECT DISTINCT ON (key)
            id,
            key,
            created
        FROM configuration
        ORDER BY key ASC, created DESC
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
