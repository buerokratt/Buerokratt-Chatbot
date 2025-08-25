INSERT INTO chat_smax_syncrhonization (chat_base_id, status, smax_status_code, smax_error_message)
VALUES (:chatBaseId, :status, :smaxStatusCode, :smaxErrorMessage) returning *;
