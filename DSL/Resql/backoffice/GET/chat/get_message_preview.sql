SELECT content AS preview
FROM message_preview
WHERE chat_base_id = :chatId
ORDER BY created DESC
LIMIT 1;
