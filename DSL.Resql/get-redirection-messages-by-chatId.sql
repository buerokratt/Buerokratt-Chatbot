SELECT chat_base_id,
       base_id,
       content,
       event,
       author_id,
       author_timestamp,
       author_first_name,
       author_last_name,
       author_role,
       rating,
       created,
       forwarded_by_user,
       forwarded_from_csa,
       forwarded_to_csa,
       updated
FROM message
WHERE base_id = ANY (ARRAY(SELECT content::varchar[] AS message_ids
                           FROM message
                           WHERE chat_base_id = :chatId
                             AND event = 'requested-chat-forward'
                           ORDER BY updated DESC
                           LIMIT 1))
  AND id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id);

