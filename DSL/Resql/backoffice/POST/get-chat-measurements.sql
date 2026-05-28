SELECT cm.chat_base_id::text AS chat_uuid,
       cm.author_display_name,
       cm.type,
       cm.value,
       cm.created_at
FROM chat_measurements cm
WHERE cm.chat_base_id = CAST(:chatUuid AS uuid)
ORDER BY cm.created_at ASC, cm.id ASC;
