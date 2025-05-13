SELECT copy_row_with_modifications(
    'chat',
    'id', '::INTEGER', id,
    ARRAY[
        'customer_support_id', '', '',
        'customer_support_display_name', '', '',
        'csa_title', '', '',
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
) FROM chat
WHERE
    id IN (
        SELECT MAX(id) FROM chat
        GROUP BY base_id
    )
    AND base_id = :chatId
    AND ended IS null;
