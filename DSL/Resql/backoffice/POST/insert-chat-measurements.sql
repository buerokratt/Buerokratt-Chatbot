WITH latest_chat AS (
    SELECT base_id
    FROM chat
    WHERE base_id = :chatUuid
    ORDER BY updated DESC
    LIMIT 1
),
latest_author AS (
    SELECT display_name
    FROM "user"
    WHERE id_code = :authorId
      AND status <> 'deleted'
    ORDER BY id DESC
    LIMIT 1
),
measurement_values AS (
    SELECT CASE LOWER(TRIM(:type))
               WHEN 'theme' THEN 'THEME'
               WHEN 'quality' THEN 'QUALITY'
               WHEN 'follow_up_action' THEN 'FOLLOW_UP_ACTION'
           END::measurement_type AS type,
           value
    FROM unnest(
        CASE
            WHEN COALESCE(array_length(ARRAY[:value]::TEXT[], 1), 0) = 0
                THEN ARRAY['']::TEXT[]
            ELSE ARRAY[:value]::TEXT[]
        END
    ) AS value
)
INSERT INTO chat_measurements (chat_base_id, author_display_name, type, value)
SELECT latest_chat.base_id::uuid,
       COALESCE(NULLIF(latest_author.display_name, ''), :authorId),
       measurement_values.type,
       measurement_values.value
FROM measurement_values
         CROSS JOIN latest_chat
         CROSS JOIN latest_author
WHERE measurement_values.type IS NOT NULL
  AND measurement_values.value IS NOT NULL
RETURNING id, chat_base_id::text AS chat_uuid, author_display_name, type, value, created_at;
