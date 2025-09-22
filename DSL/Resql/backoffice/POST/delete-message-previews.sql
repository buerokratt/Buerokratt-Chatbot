INSERT INTO message_preview (chat_base_id, content)
SELECT unnest(:chatIds::uuid[]), :content
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;