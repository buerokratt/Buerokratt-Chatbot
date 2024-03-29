UPDATE chat
SET scheduled_for_terminated = :scheduledForTerminated::timestamp with time zone
WHERE chat_id = :chatId;
