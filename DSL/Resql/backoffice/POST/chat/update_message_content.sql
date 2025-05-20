SELECT copy_row_with_modifications(
    'message',
    'id', '::INTEGER', id::VARCHAR,
    ARRAY[
        'content', '', '',
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
) FROM message
WHERE chat_base_id IN (:chats);
