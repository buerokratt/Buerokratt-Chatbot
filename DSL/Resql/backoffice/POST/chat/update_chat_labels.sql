SELECT (copy_row_with_modifications(
    'chat',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'labels', '::VARCHAR[]', (ARRAY [:labels])::VARCHAR,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)) AS id, NOW()::TEXT as updated FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
