SELECT m.base_id      AS id,
       m.chat_base_id AS chatId,
       m.content,
       m.event,
       m.author_id,
       m.author_timestamp,
       m.author_first_name,
       m.author_last_name,
       m.author_role,
       m.forwarded_by_csa,
       m.forwarded_from_csa,
       m.forwarded_to_csa,
       m.forward_received_from_csa,
       m.forward_received_by_csa,
       rating,
       created,
       updated
FROM message m
WHERE id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id)
  AND :timeRangeBegin::timestamp
    with time zone < m.updated
ORDER BY created;