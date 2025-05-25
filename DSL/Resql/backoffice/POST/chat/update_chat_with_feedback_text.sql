SELECT (copy_row_with_modifications(
    'chat',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'feedback_text', '', :feedbackText,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)) AS id, NOW()::TEXT as updated FROM chat
WHERE base_id = :id
ORDER BY updated DESC
LIMIT 1;
