SELECT COUNT(*) AS total_count
FROM (
    SELECT DISTINCT ON (chat_id) *
    FROM denormalized_chat
    ORDER BY chat_id, denormalized_record_created DESC
) AS latest_chats
WHERE
    latest_chats.ended IS NOT NULL
    AND latest_chats.status = 'ENDED'
    AND (
        (
            latest_chats.end_user_id IS NOT NULL
            AND latest_chats.end_user_id <> ''
            AND latest_chats.ended::DATE <= :auth_date::DATE
        )
        OR
        (
            latest_chats.end_user_id IS NULL
            OR latest_chats.end_user_id = '' AND latest_chats.ended::DATE <= :anon_date::DATE
        )
    )
    AND EXISTS (SELECT 1
                    FROM denormalized_chat AS dc
                    WHERE dc.chat_id = latest_chats.chat_id
                        AND (dc.last_message IS NOT NULL and dc.last_message <> '' ));