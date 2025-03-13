SELECT chat.*, message.*
FROM chat
         INNER JOIN message ON chat.base_id = message.chat_base_id
WHERE chat.base_id IN (:chats);