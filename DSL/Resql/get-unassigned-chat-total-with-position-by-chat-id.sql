WITH unassigned_chats AS (SELECT base_id, row_number() over (ORDER BY created) as position
                          FROM chat
                          WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
                            AND ended IS NULL
                            AND customer_support_id = '')
SELECT (CASE
            WHEN :chatId IS NULL OR :chatId = ''
                THEN (SELECT 0)
            ELSE (SELECT position FROM unassigned_chats WHERE base_id = :chatId) END) as position_in_unassigned_chats,
       (SELECT COUNT(*) FROM unassigned_chats)                                        as unassigned_chat_total
FROM unassigned_chats
LIMIT 1;