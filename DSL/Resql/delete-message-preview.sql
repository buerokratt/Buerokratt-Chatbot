INSERT INTO message_preview(chat_base_id, content)
VALUES (:chatId, NULL)
ON CONFLICT(id) DO UPDATE SET content = :content;
