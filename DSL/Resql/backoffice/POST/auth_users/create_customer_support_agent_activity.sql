SELECT copy_row_with_modifications(
    'denormalized_user_data',
   'id', '::UUID', id::VARCHAR,
    ARRAY[
        'status', '::status', :status,
        'status_comment', '', :statusComment,
        'csa_created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR,
        'active', '::BOOL', :active::VARCHAR,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)
FROM denormalized_user_data
WHERE id_code = :userIdCode
ORDER BY created DESC
LIMIT 1;
