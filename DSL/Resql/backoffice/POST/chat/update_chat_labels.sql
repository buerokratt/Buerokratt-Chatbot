SELECT copy_row_with_modifications(
    'chat',
    'id', '::INTEGER', id,
    'labels', '::TEXT[]', (ARRAY [:labels])::TEXT,
    'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
) FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
