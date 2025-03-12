SELECT content::varchar[] AS message_ids,
       chat_base_id,
       base_id,
       author_id,
       author_timestamp,
       author_first_name,
       author_last_name,
       author_role,
       forwarded_by_user,
       forwarded_from_csa,
       forwarded_to_csa,
       created
FROM message
WHERE chat_base_id = :chatId
  AND event = 'requested-chat-forward'
ORDER BY updated DESC
LIMIT 1
