UPDATE chat
SET scheduled_for_terminated = NULL
WHERE base_id = :chatId;
