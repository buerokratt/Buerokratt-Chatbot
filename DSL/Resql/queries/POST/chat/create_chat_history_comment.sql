INSERT INTO chat_history_comments (chat_id, comment, created, author_display_name)
VALUES (:chatId, :comment, :created::TIMESTAMP WITH TIME ZONE, :authorDisplayName)
RETURNING id, chat_id, comment, created, author_display_name;
