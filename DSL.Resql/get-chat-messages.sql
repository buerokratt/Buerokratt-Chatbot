SELECT m.base_id      AS id,
       m.chat_base_id AS chat_id,
       m.content,
       m.event,
       m.author_id,
       m.author_timestamp,
       m.author_first_name,
       m.author_last_name,
       m.author_role,
       rating,
       created,
       updated
FROM message m
WHERE id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id)
ORDER BY created;