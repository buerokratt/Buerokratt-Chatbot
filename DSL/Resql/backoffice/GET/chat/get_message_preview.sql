SELECT content AS preview
FROM chat.message_preview
WHERE chat_base_id = :chatId
ORDER BY created DESC
LIMIT 1;
