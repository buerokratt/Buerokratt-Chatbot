INSERT INTO attachment(base_id, chat_base_id, message_base_id, file_name, file_size, mime_type, storage_path, uploaded_by, uploaded_by_role, status, created)
VALUES (:baseId, :chatBaseId, NULLIF(:messageBaseId, ''), :fileName, :fileSize::bigint, :mimeType, :storagePath, NULLIF(:uploadedBy, ''), :uploadedByRole, 'available', NOW());
