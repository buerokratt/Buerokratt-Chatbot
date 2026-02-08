SELECT
    id,
    base_id,
    chat_base_id,
    message_base_id,
    file_name,
    file_size,
    mime_type,
    s3_bucket,
    s3_key,
    uploaded_by_user_id,
    uploaded_by_role,
    status,
    created,
    updated
FROM attachment
WHERE
    base_id =:baseId;