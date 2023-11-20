SELECT m.base_id      AS id,
       m.chat_base_id AS chatId,
       m.content,
       m.buttons,
       m.event,
       m.author_id,
       m.author_timestamp,
       m.author_first_name,
       m.author_last_name,
       m.author_role,
       m.forwarded_by_user,
       m.forwarded_from_csa,
       m.forwarded_to_csa,
       mp.content AS preview,
       rating,
       created,
       updated
FROM message m
LEFT JOIN message_preview mp ON m.chat_base_id = mp.chat_base_id
WHERE id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id)
  AND :timeRangeBegin::timestamp
    with time zone < m.updated
ORDER BY created;
