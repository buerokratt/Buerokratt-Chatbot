SELECT
    m.content,
    m.event,
    m.created,
    m.author_role,
    m.buttons,
    m.options,
    m.author_first_name,
    m.author_last_name
FROM message AS m
WHERE
    m.chat_base_id = :chatId
    AND m.content != 'message-read'
ORDER BY m.id ASC;
