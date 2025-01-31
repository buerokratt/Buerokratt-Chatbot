WITH ChatsToDelete AS (
    SELECT COUNT(*) AS total_count
    FROM chat c
    WHERE c.ended IS NOT NULL
      AND c.status = 'ENDED'
      AND (
        (end_user_id IS NOT NULL AND end_user_id <> '' AND ended::date <= :auth_date::date)
            OR
        (end_user_id IS NULL OR end_user_id = '' AND ended::date <= :anon_date::date)
        )
      AND EXISTS (
        SELECT 1
        FROM message m
        WHERE m.chat_base_id = c.base_id
            AND m.content IS NOT NULL
            AND m.content <> ''
      )
    )
SELECT total_count
FROM ChatsToDelete;