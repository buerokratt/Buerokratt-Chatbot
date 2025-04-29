SELECT copy_row_with_modifications(
    'chat',
    'id', '::INTEGER', id::VARCHAR,
    'feedback_text', '', :feedbackText,
    'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
) FROM chat
WHERE base_id = :id
ORDER BY updated DESC
LIMIT 1;
