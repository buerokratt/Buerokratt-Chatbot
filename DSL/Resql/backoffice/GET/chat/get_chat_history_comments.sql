SELECT
    id,
    chat_id,
    comment,
    created,
    author_display_name
FROM chat.chat_history_comments
WHERE chat_id = :chatId
ORDER BY created DESC
LIMIT 1;
