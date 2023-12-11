INSERT INTO "chat_history_comments" (chat_id, comment)
VALUES (:chatId, :comment)
ON CONFLICT (chat_id) DO UPDATE 
SET comment = :comment RETURNING *;
