WITH all_active_chats AS (SELECT base_id, row_number() over (ORDER BY created) as position
                          FROM chat
                          WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id) AND ended IS NULL AND customer_support_id = '')
SELECT position
FROM all_active_chats
WHERE base_id = :chatId;