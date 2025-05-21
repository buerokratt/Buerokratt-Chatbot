SELECT copy_row_with_modifications(
    'chat',
    'id', '::INTEGER', id::VARCHAR,
    ARRAY[
        'end_user_email', '', :endUserEmail,
        'end_user_phone', '', :endUserPhone,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)
FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
