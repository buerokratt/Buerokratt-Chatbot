WITH ended_chats AS (SELECT id, base_id
                     FROM chat
                     WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
                       AND ended IS NOT NULL
                       AND ended > (now() - '1 month'::interval)
                       AND customer_support_id <> ''
                       AND customer_support_id != (SELECT value
                                                   FROM configuration
                                                   WHERE key = 'bot_institution_id'
                                                     AND id IN (SELECT max(id) from configuration GROUP BY key)
                                                     AND deleted = FALSE))
SELECT SUM(ABS(EXTRACT(EPOCH FROM
                       (SELECT author_timestamp
                        FROM message
                        WHERE id IN (SELECT min(id)
                                     FROM message
                                     WHERE chat_base_id = c.base_id
                                       AND author_role = 'backoffice-user'))
                           - (SELECT author_timestamp
                              FROM message
                              WHERE id IN (SELECT max(id)
                                           FROM message
                                           WHERE chat_base_id = c.base_id))
    ))) as duration_in_seconds
FROM chat c
         RIGHT JOIN ended_chats ec ON c.id = ec.id;