SELECT m.content,
       m.event,
       m.created,
       m.author_role,
       COALESCE(u.first_name, m.author_first_name, u.display_name) AS author_first_name,
       COALESCE(u.last_name, m.author_last_name) AS author_last_name,
       u.csa_title,
       m.buttons
FROM message m
LEFT JOIN "user" u ON m.author_id = u.id_code
WHERE m.chat_base_id = :chatId
  AND m.content != 'message-read'
ORDER BY m.id;
