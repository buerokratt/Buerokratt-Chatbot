UPDATE chat
SET scheduled_for_terminated = :scheduledForTerminated::timestamp with time zone
WHERE base_id = :chatId;
