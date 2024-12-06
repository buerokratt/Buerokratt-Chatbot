WITH ChatsToDelete AS (
    SELECT COUNT(*) AS total_count
    FROM chat c
    WHERE c.ended IS NOT NULL
      AND c.status = 'ENDED'
      AND c.created::date BETWEEN :start::date AND :end::date
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