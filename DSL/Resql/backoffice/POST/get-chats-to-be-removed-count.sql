WITH LatestChats AS (
    SELECT DISTINCT ON (base_id) base_id, ended, status, end_user_id, preserve
    FROM chat
    WHERE ended IS NOT NULL
    ORDER BY base_id, id DESC
),
ChatsToDelete AS (
    SELECT COUNT(*) AS total_count
    FROM LatestChats c
    WHERE c.status = 'ENDED'
      AND (c.preserve IS NULL OR c.preserve IS NOT TRUE)
      AND (
        (end_user_id IS NOT NULL AND end_user_id <> '' AND ended::date >= :auth_date_start::date AND ended::date <= :auth_date::date)
            OR
        (end_user_id IS NULL OR end_user_id = '' AND ended::date >= :anon_date_start::date AND ended::date <= :anon_date::date)
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