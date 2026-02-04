SELECT 
    base_id,
    chat_base_id,
    message_base_id,
    file_name,
    file_size,
    mime_type,
    storage_path,
    uploaded_by,
    uploaded_by_role,
    status,
    created,
    updated
FROM attachment
WHERE chat_base_id = :chatBaseId
  AND status = 'available'
ORDER BY created DESC;
