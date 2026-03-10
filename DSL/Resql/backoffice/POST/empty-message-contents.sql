UPDATE message
SET content = ''
WHERE chat_base_id IN (:chats);