INSERT INTO message_preview(chat_base_id, content)
VALUES (:chatId, :content)
ON CONFLICT(chat_base_id) DO UPDATE SET content = :content;