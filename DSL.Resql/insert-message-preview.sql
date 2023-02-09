INSERT INTO message_preview(chat_base_id, base_id,  content, event, created)
VALUES (:chatId,
        (CASE
             WHEN :messageId IS NOT NULL AND :messageId <> '' THEN :messageId
             ELSE (gen_random_uuid()::varchar) END),
        :content, :event,
        :created::timestamp with time zone);