WITH
    chats_to_delete AS (
        SELECT COUNT(*) AS total_count
        FROM chat AS c
        WHERE
            c.ended IS NOT NULL
            AND c.status = 'ENDED'
            AND (
                (
                    c.end_user_id IS NOT NULL
                    AND c.end_user_id <> ''
                    AND c.ended::DATE <= :auth_date::DATE
                )
                OR
                (
                    c.end_user_id IS NULL
                    OR c.end_user_id = '' AND c.ended::DATE <= :anon_date::DATE
                )
            )
            AND EXISTS (
                SELECT 1
                FROM message AS m
                WHERE
                    m.chat_base_id = c.base_id
                    AND m.content IS NOT NULL
                    AND m.content <> ''
            )
    )

SELECT total_count
FROM chats_to_delete;
