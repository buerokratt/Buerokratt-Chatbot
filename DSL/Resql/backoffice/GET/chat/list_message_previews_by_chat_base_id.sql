SELECT DISTINCT ON (chat_base_id) content, chat_base_id 
  FROM chat.message_preview
  Where chat_base_id = :chatId
  ORDER BY chat_base_id, created DESC;