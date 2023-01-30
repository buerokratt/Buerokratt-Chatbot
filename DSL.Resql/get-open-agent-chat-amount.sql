SELECT COUNT(*) as open_chats
FROM chat
WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
  AND ended IS null
  AND customer_support_id <> ''
  AND customer_support_id != (SELECT value
                              FROM configuration
                              WHERE key = 'bot_institution_id'
                                AND id IN (SELECT max(id) from configuration GROUP BY key)
                                AND deleted = FALSE);