SELECT copy_row_with_modifications(
    'chat',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'end_user_id', '', :endUserId,
        'end_user_first_name', '', :endUserFirstName,
        'end_user_last_name', '', :endUserLastName,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
), NOW()::TEXT as updated FROM chat
WHERE base_id = :chatId
ORDER BY updated DESC
LIMIT 1;
