SELECT copy_row_with_modifications(
    'chat',                                   -- Table name
    'id', '::INTEGER',                        -- ID column name and type
    (SELECT MAX(id) FROM chat WHERE base_id = dc.chat_id)::VARCHAR,
    ARRAY[                                    -- Direct array of modifications
        'customer_support_id', '', '',        -- Reset customer_support_id
        'customer_support_display_name', '', '',  -- Reset customer_support_display_name
        'csa_title', '', '', -- Reset csa_title
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
), NOW()::TEXT as updated
FROM denormalized_chat dc
WHERE
    dc.ended IS NULL
    AND dc.customer_support_id = :userId
    -- Get only the latest record for each chat
    AND dc.denormalized_record_created = (
        SELECT MAX(dc_inner.denormalized_record_created)
        FROM denormalized_chat dc_inner
        WHERE dc_inner.chat_id = dc.chat_id
        AND dc_inner.ended IS NULL
        AND dc_inner.customer_support_id = :userId
    )
    AND dc.last_message_with_content_and_not_rating_or_forward IS NOT NULL
    AND dc.last_message_with_not_rating_or_forward_events_timestamp IS NOT NULL;