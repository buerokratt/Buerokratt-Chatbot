SELECT copy_row_with_modifications(
    'denormalized_chat',                                   -- Table name
    'id', '::INTEGER',                        -- ID column name and type
    id::VARCHAR,
    ARRAY[                                    -- Direct array of modifications
        'customer_support_id', '', '',        -- Reset customer_support_id
        'customer_support_display_name', '', '',  -- Reset customer_support_display_name
        'customer_support_first_name', '', '',        -- Reset customer_support_first_name
        'customer_support_last_name', '', '',  -- Reset customer_support_last_name
        'csa_title', '', '', -- Reset csa_title
        'updated', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END,
        'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END
    ]::VARCHAR[]
)
FROM denormalized_chat dc
WHERE
    dc.ended IS NULL
    AND dc.customer_support_id = :userId
    -- Get only the latest record for each chat
    AND dc.id IN (
        SELECT MAX(id)
        FROM denormalized_chat dc_inner
        WHERE dc_inner.ended IS NULL
        AND dc_inner.customer_support_id = :userId
        GROUP BY chat_id
    )
    AND dc.last_message_with_content_and_not_rating_or_forward IS NOT NULL
    AND dc.last_message_with_not_rating_or_forward_events_timestamp IS NOT NULL;