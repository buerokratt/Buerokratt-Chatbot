SELECT m.base_id      AS id,
       m.chat_base_id AS chatId,
       m.content,
       m.event,
       created
FROM message m
WHERE id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id)
ORDER BY created;