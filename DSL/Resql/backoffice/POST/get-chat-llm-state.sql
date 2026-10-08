SELECT chat_base_id AS chat_id,
       previous_response_id,
       updated
FROM chat_llm_state
WHERE chat_base_id = :chatId;
