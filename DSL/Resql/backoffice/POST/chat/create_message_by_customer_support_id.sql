SELECT copy_row_with_modifications(
    'message',
    'id', '::INTEGER', id,
    ARRAY[
        'content', '', :content,
        'event', '', :event,
        'author_id', '', :authorId,
        'author_role', '', :authorRole,
        'base_id', '', gen_random_uuid(),
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)::INTEGER as id, chat_base_id, base_id
FROM message
WHERE
    chat_base_id IN (
        SELECT base_id
        FROM chat
        WHERE
            id IN (
                SELECT MAX(id) FROM chat
                GROUP BY base_id
            )
            AND customer_support_id = :customerSupportId
            AND ended IS null
    )
    AND id IN (
        SELECT MAX(id) FROM message
        GROUP BY chat_base_id
    )