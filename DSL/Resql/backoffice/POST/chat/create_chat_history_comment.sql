INSERT INTO chat_history_comments (chat_id, commen, author_display_name)
VALUES (:chatId, :comment, :authorDisplayName)
RETURNING id, chat_id, comment, created, author_display_name;
