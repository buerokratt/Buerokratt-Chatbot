INSERT INTO "chat_history_comments" (chat_id, comment)
VALUES (:chatId, :comment)
RETURNING *;
