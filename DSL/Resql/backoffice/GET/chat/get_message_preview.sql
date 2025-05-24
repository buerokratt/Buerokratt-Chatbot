SELECT content AS preview
FROM chat.message_preview
WHERE chat_base_id = :chatId
ORDER BY id DESC
LIMIT 1;
