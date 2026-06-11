SELECT * FROM chat_smax_syncrhonization
WHERE chat_base_id = :chatBaseId
AND status = 'SUCCESS'
LIMIT 1;
