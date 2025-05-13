SELECT copy_row_with_modifications(
    'chat',
    'id', '::INTEGER', id,
    ARRAY[
        'labels', '::VARCHAR[]', (ARRAY [:labels])::VARCHAR,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
) FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
