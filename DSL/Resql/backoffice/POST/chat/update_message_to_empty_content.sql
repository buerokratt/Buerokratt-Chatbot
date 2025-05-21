SELECT copy_row_with_modifications(
    'message',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'content', '', '',
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
), NOW()::TEXT as updated FROM message AS m1
WHERE chat_base_id IN (:chats) AND updated = (select max(updated) from message AS m2 where m1.chat_base_id = m2.chat_base_id and m1.base_id = m2.base_id);