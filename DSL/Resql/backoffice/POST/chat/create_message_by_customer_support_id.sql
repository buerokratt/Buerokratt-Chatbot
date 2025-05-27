SELECT copy_row_with_modifications(
    'message',
    'id', '::INTEGER', id::VARCHAR,
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
FROM message AS m1
WHERE
    chat_base_id IN (
        SELECT base_id
        FROM chat AS c1
        WHERE
            updated = (
                SELECT MAX(c2.updated) FROM chat c2
                WHERE c2.base_id = c1.base_id
            )
            AND customer_support_id = :customerSupportId
            AND ended IS null
    )
    AND id = (
        SELECT id FROM message AS m2
        WHERE m1.chat_base_id = m2.chat_base_id
        ORDER BY updated DESC LIMIT 1
    );