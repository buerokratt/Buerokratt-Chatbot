-- Using array approach directly
SELECT copy_row_with_modifications(
    'denormalized_chat',                              -- Table name for denormalized_chat
    'id', '::INTEGER', id::VARCHAR,                   -- ID column handling
    ARRAY[                                            -- Direct array of modifications
        'chat_id', '', :chatId,
        'feedback_text', '', :feedbackText,
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
FROM denormalized_chat
WHERE chat_id = :chatId
ORDER BY id DESC
LIMIT 1;