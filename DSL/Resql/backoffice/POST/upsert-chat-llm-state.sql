INSERT INTO chat_llm_state (chat_base_id, previous_response_id, updated)
VALUES (:chatId, :previousResponseId, now())
ON CONFLICT (chat_base_id)
DO UPDATE SET previous_response_id = EXCLUDED.previous_response_id,
              updated = EXCLUDED.updated;
