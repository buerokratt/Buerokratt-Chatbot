INSERT INTO "chat_history_comments" (chat_id, comment)
VALUES (:chatId, :comment)
RETURNING id, chat_id, comment;
