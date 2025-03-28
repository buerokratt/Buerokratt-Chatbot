INSERT INTO "chat_history_comments" (chat_id, comment, created, author_display_name)
VALUES (:chatId, :comment, :created::timestamp with time zone, :authorDisplayName)
RETURNING id, chat_id, comment, created, author_display_name;
