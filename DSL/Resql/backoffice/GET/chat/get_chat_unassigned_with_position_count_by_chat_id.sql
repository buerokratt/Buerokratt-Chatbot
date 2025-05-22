WITH
    unassigned_chats AS (
        SELECT
            base_id,
            ROW_NUMBER() OVER (
                ORDER BY created
            ) AS position
        FROM chat AS c1
        WHERE
            updated = (
                SELECT MAX(c2.updated) FROM chat AS c2
                WHERE c1.base_id = c2.base_id
            )
            AND ended IS NULL
            AND customer_support_id = ''
    )

SELECT
    (CASE
        WHEN :chatId IS NULL OR :chatId = ''
            THEN (SELECT 0)
        ELSE (
            SELECT position FROM unassigned_chats
            WHERE base_id = :chatId
        )
    END) AS position_in_unassigned_chats,
    (SELECT COUNT(base_id) FROM unassigned_chats) AS unassigned_chat_total
FROM unassigned_chats
LIMIT 1;
