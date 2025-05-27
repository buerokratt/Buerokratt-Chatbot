SELECT copy_row_with_modifications(
    'chat',
    'id', '::INTEGER', id::VARCHAR,
    ARRAY[
        'labels', '::VARCHAR[]', (ARRAY [:labels])::VARCHAR,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
), NOW()::TEXT as updated FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
