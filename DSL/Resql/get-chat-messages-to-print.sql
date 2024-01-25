SELECT m.content,
       m.event,
       m.created,
       m.author_role,
       m.author_first_name,
       m.author_last_name,
       u.csa_title,
       m.buttons
FROM message m
LEFT JOIN "user" u ON m.author_id = u.id_code
WHERE m.id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id)
  AND m.content != 'message-read'
ORDER BY m.created;
