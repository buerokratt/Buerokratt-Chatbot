INSERT INTO chat.chat_history_comments (chat_id, comment, author_display_name)
VALUES (:chatId, :comment, :authorDisplayName)
RETURNING id, chat_id, comment, created, author_display_name;
