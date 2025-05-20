-- Using array approach directly
SELECT copy_row_with_modifications(
    'denormalized_chat',                              -- Table name for denormalized_chat
    'id', '::INTEGER', id::VARCHAR,                   -- ID column handling
    ARRAY[                                            -- Direct array of modifications
        'last_message_including_empty_content', '', '',
        'last_message_event_with_content', '', NULL,
        'contacts_message', '', 
            CASE
                WHEN contacts_message IS NOT NULL THEN ''
                ELSE contacts_message
            END,
        'last_message_with_content_and_not_rating_or_forward', '', NULL,
        'last_message', '', NULL,
        'first_message', '', NULL,
        'first_message_timestamp', '::TIMESTAMP WITH TIME ZONE', NULL,
        'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END,
        'all_messages', '::TEXT[]', '{}'
    ]::VARCHAR[]
)
FROM denormalized_chat
WHERE chat_id IN (:chats) AND denormalized_record_created = (
    SELECT MAX(denormalized_record_created)
    FROM denormalized_chat dc_inner
    WHERE dc_inner.chat_id = dc.chat_id
);
