UPDATE chat
SET scheduled_for_terminated = null
WHERE chat_id = :chatId;
